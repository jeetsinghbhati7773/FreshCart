import prisma from "../../config/prisma.js";
import { paypalFetch } from "./paypalClient.js";
import { getPayPalAccessToken } from "./paypalAuth.js";
import { ReservationService } from "../reservationService.js";

export class PayPalWebhookService {
  /**
   * Verify cryptographic PayPal webhook signature using PayPal REST API
   * @param {object} headers - HTTP request headers
   * @param {object} body - Webhook JSON body
   * @returns {Promise<boolean>} True if valid, false otherwise
   */
  static async verifySignature(headers, body) {
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    if (!webhookId) {
      console.warn("⚠️ PAYPAL_WEBHOOK_ID is not configured. Webhook signature verification bypassed in dev/sandbox.");
      return true;
    }

    // In local sandbox testing where mock/simulated events are posted without live certificates
    const authAlgo = headers["paypal-auth-algo"] || headers["PAYPAL-AUTH-ALGO"];
    const certUrl = headers["paypal-cert-url"] || headers["PAYPAL-CERT-URL"];
    const transmissionId = headers["paypal-transmission-id"] || headers["PAYPAL-TRANSMISSION-ID"];
    const transmissionSig = headers["paypal-transmission-sig"] || headers["PAYPAL-TRANSMISSION-SIG"];
    const transmissionTime = headers["paypal-transmission-time"] || headers["PAYPAL-TRANSMISSION-TIME"];

    if (!authAlgo || !certUrl || !transmissionId || !transmissionSig || !transmissionTime) {
      console.warn("⚠️ Missing PayPal signature headers. Bypassing only if in local development mode.");
      return (process.env.NODE_ENV || "development") === "development";
    }

    try {
      const accessToken = await getPayPalAccessToken();
      const verificationPayload = {
        auth_algo: authAlgo,
        cert_url: certUrl,
        transmission_id: transmissionId,
        transmission_sig: transmissionSig,
        transmission_time: transmissionTime,
        webhook_id: webhookId,
        webhook_event: body,
      };

      const result = await paypalFetch(
        "/v1/notifications/verify-webhook-signature",
        {
          method: "POST",
          body: JSON.stringify(verificationPayload),
        },
        accessToken
      );

      return result.verification_status === "SUCCESS";
    } catch (err) {
      console.error("PayPal webhook signature verification error:", err.message);
      return false;
    }
  }

  /**
   * Process incoming webhook event idempotently
   * @param {object} event - Webhook event payload
   * @returns {Promise<object>}
   */
  static async processWebhookEvent(event) {
    const eventId = event.id;
    const eventType = event.event_type;
    const resource = event.resource || {};
    const resourceId = resource.id;

    if (!eventId || !eventType) {
      throw new Error("Invalid webhook event: missing id or event_type.");
    }

    // 1. Check for existing event record (idempotency check)
    const existing = await prisma.webhookEvent.findUnique({
      where: {
        provider_eventId: {
          provider: "PAYPAL",
          eventId,
        },
      },
    });

    if (existing && existing.processingStatus === "PROCESSED") {
      return { status: "ALREADY_PROCESSED", eventId, eventType };
    }

    // Create or update pending webhook event
    const webhookRecord = existing || (await prisma.webhookEvent.create({
      data: {
        provider: "PAYPAL",
        eventId,
        eventType,
        resourceId,
        processingStatus: "PENDING",
        payload: event,
      },
    }));

    try {
      // 2. Event Dispatching
      switch (eventType) {
        case "PAYMENT.CAPTURE.COMPLETED": {
          await this.handleCaptureCompleted(resource);
          break;
        }

        case "PAYMENT.CAPTURE.DENIED":
        case "PAYMENT.CAPTURE.REFUNDED": {
          await this.handleCaptureFailedOrRefunded(resource, eventType);
          break;
        }

        case "CHECKOUT.ORDER.APPROVED": {
          console.log(`ℹ️ PayPal order approved: ${resource.id}`);
          break;
        }

        default:
          console.log(`ℹ️ Unhandled PayPal webhook event type: ${eventType}`);
          break;
      }

      // 3. Mark processed
      await prisma.webhookEvent.update({
        where: { id: webhookRecord.id },
        data: {
          processingStatus: "PROCESSED",
          processedAt: new Date(),
        },
      });

      return { status: "PROCESSED", eventId, eventType };
    } catch (error) {
      console.error(`Error processing webhook event ${eventId}:`, error);
      await prisma.webhookEvent.update({
        where: { id: webhookRecord.id },
        data: {
          processingStatus: "FAILED",
          errorMessage: error.message,
        },
      });
      throw error;
    }
  }

  /**
   * Handle PAYMENT.CAPTURE.COMPLETED event
   */
  static async handleCaptureCompleted(capture) {
    const captureId = capture.id;
    const customId = capture.custom_id;
    const amountVal = parseFloat(capture.amount?.value || 0);
    const currency = capture.amount?.currency_code || "USD";

    // Locate order by customId (localOrderId) or existing payment record
    let order = null;
    if (customId) {
      order = await prisma.order.findUnique({ where: { id: customId } });
    }

    if (!order) {
      const payment = await prisma.payment.findFirst({
        where: {
          OR: [
            { providerCaptureId: captureId },
            { providerOrderId: capture.supplementary_data?.related_ids?.order_id },
          ],
        },
      });
      if (payment) {
        order = await prisma.order.findUnique({ where: { id: payment.orderId } });
      }
    }

    if (!order) {
      console.warn(`Webhook: No matching FreshCart order found for capture ${captureId}`);
      return;
    }

    // Atomic update
    await prisma.$transaction(async (tx) => {
      // 1. Update order
      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "Paid",
          paypalCaptureId: captureId,
          status: "Order Placed",
        },
      });

      // 2. Consume reservations
      await ReservationService.consumeReservations(order.id, tx);

      // 3. Upsert Payment record
      const existingPayment = await tx.payment.findFirst({
        where: { orderId: order.id },
      });

      if (existingPayment) {
        await tx.payment.update({
          where: { id: existingPayment.id },
          data: {
            providerCaptureId: captureId,
            status: "COMPLETED",
            rawResponse: capture,
          },
        });
      } else {
        await tx.payment.create({
          data: {
            orderId: order.id,
            provider: "PAYPAL",
            providerCaptureId: captureId,
            amount: amountVal,
            currency,
            originalAmount: order.totalAmount,
            originalCurrency: "INR",
            status: "COMPLETED",
            rawResponse: capture,
          },
        });
      }
    });

    console.log(`✅ Webhook: Order #${order.id} marked as Paid via capture ${captureId}`);
  }

  /**
   * Handle PAYMENT.CAPTURE.DENIED or REFUNDED
   */
  static async handleCaptureFailedOrRefunded(capture, eventType) {
    const captureId = capture.id;
    const payment = await prisma.payment.findFirst({
      where: { providerCaptureId: captureId },
    });

    if (payment) {
      const newStatus = eventType.includes("REFUNDED") ? "Refunded" : "Failed";
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: newStatus },
      });
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: newStatus.toUpperCase() },
      });

      if (newStatus === "Failed") {
        await ReservationService.releaseReservations(payment.orderId, "RELEASED");
      }
    }
  }
}

export default PayPalWebhookService;

