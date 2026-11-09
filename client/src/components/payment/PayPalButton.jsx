import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertCircle, CheckCircle, CreditCard } from "lucide-react";
import {
  getPayPalConfig,
  createPayPalOrder,
  capturePayPalOrder,
  cancelPayPalOrder,
} from "../../services/paypalService";

export default function PayPalButton({
  shippingAddress,
  directItems = null,
  onSuccess,
  onError,
}) {
  const navigate = useNavigate();
  const paypalContainerRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [sdkReady, setSdkReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function initSdk() {
      try {
        setLoading(true);
        const cfg = await getPayPalConfig();
        if (!isMounted) return;
        setConfig(cfg);

        // Check if paypal script already exists
        const existingScript = document.getElementById("paypal-sdk-script");
        if (window.paypal && existingScript) {
          setSdkReady(true);
          setLoading(false);
          return;
        }

        // Dynamically load PayPal SDK
        const script = document.createElement("script");
        script.id = "paypal-sdk-script";
        script.src = `https://www.paypal.com/sdk/js?client-id=${cfg.clientId}&currency=${cfg.currency}&intent=capture`;
        script.async = true;

        script.onload = () => {
          if (isMounted) {
            setSdkReady(true);
            setLoading(false);
          }
        };

        script.onerror = () => {
          if (isMounted) {
            setLoading(false);
            setErrorMessage(
              "Could not load PayPal SDK. You can complete the checkout using the Sandbox Simulation button below."
            );
          }
        };

        document.body.appendChild(script);
      } catch (err) {
        if (isMounted) {
          setLoading(false);
          setErrorMessage(err.message || "Failed to initialize PayPal");
        }
      }
    }

    initSdk();

    return () => {
      isMounted = false;
    };
  }, []);

  // Render official PayPal Buttons when SDK is ready
  useEffect(() => {
    if (!sdkReady || !window.paypal || !paypalContainerRef.current) return;

    paypalContainerRef.current.innerHTML = "";

    try {
      window.paypal
        .Buttons({
          style: {
            layout: "vertical",
            color: "gold",
            shape: "rect",
            label: "paypal",
            height: 48,
          },

          createOrder: async () => {
            try {
              setIsProcessing(true);
              setErrorMessage("");
              const res = await createPayPalOrder({
                shippingAddress,
                items: directItems,
              });

              if (!res.success || !res.paypalOrderId) {
                throw new Error(res.message || "Failed to create PayPal order.");
              }

              setCurrentOrder(res);
              return res.paypalOrderId;
            } catch (err) {
              setIsProcessing(false);
              const msg = err.response?.data?.message || err.message;
              setErrorMessage(msg);
              if (onError) onError(msg);
              throw err;
            }
          },

          onApprove: async (data) => {
            try {
              setIsProcessing(true);
              const captureRes = await capturePayPalOrder({
                orderId: currentOrder?.orderId,
                paypalOrderId: data.orderID,
              });

              if (!captureRes.success) {
                throw new Error(captureRes.message || "Capture was not completed.");
              }

              setIsProcessing(false);
              if (onSuccess) onSuccess(captureRes);
              navigate(`/payment-success?orderId=${captureRes.order?.id || currentOrder?.orderId}`);
            } catch (err) {
              setIsProcessing(false);
              const msg = err.response?.data?.message || err.message;
              setErrorMessage(msg);
              if (onError) onError(msg);
            }
          },

          onCancel: async (data) => {
            setIsProcessing(false);
            if (currentOrder?.orderId) {
              await cancelPayPalOrder({
                orderId: currentOrder.orderId,
                paypalOrderId: data.orderID,
              }).catch(() => {});
            }
            navigate(`/payment-cancelled?orderId=${currentOrder?.orderId || ""}`);
          },

          onError: (err) => {
            setIsProcessing(false);
            setErrorMessage("PayPal encountered an error. Please try again.");
            if (onError) onError(err);
          },
        })
        .render(paypalContainerRef.current);
    } catch (e) {
      console.warn("Failed to render standard PayPal buttons:", e);
    }
  }, [sdkReady, shippingAddress, directItems]);

  // Sandbox simulation handler (fallback for development/demo testing)
  const handleSandboxSimulate = async () => {
    try {
      setIsProcessing(true);
      setErrorMessage("");

      // 1. Create order on Express backend
      const createRes = await createPayPalOrder({
        shippingAddress,
        items: directItems,
      });

      if (!createRes.success) {
        throw new Error(createRes.message || "Order creation failed.");
      }

      // 2. Simulate customer approval and capture
      const captureRes = await capturePayPalOrder({
        orderId: createRes.orderId,
        paypalOrderId: createRes.paypalOrderId,
      });

      if (!captureRes.success) {
        throw new Error(captureRes.message || "Payment capture failed.");
      }

      setIsProcessing(false);
      if (onSuccess) onSuccess(captureRes);
      navigate(`/payment-success?orderId=${createRes.orderId}`);
    } catch (err) {
      setIsProcessing(false);
      const msg = err.response?.data?.message || err.message;
      setErrorMessage(msg);
      if (onError) onError(msg);
    }
  };

  return (
    <div className="w-full space-y-4">
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-6 bg-gray-50 rounded-xl border border-gray-200 text-gray-500 text-sm gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
          <span>Loading PayPal Sandbox...</span>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Official PayPal Buttons Container */}
          <div
            ref={paypalContainerRef}
            className={`min-h-[50px] ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}
          />

          {/* Sandbox Direct One-Click Simulation */}
          <div className="pt-2">
            <button
              onClick={handleSandboxSimulate}
              disabled={isProcessing}
              type="button"
              className="w-full py-3 px-4 bg-gradient-to-r from-[#003087] via-[#0079C1] to-[#00457C] hover:opacity-95 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Sandbox Transaction...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Pay with PayPal Sandbox (One-Click Test)</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-gray-500 mt-1.5">
              Secure 256-bit PayPal Sandbox transaction. Stock is held and verified server-side.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

