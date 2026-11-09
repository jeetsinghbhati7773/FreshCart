import axios from "../utils/axiosInstance";
import { API_URL } from "../config";

/**
 * PayPal API client service for FreshCart Frontend
 */

export async function getPayPalConfig() {
  const response = await axios.get(`${API_URL}/payments/paypal/config`);
  return response.data;
}

export async function createPayPalOrder(payload = {}) {
  const response = await axios.post(`${API_URL}/payments/paypal/create-order`, payload);
  return response.data;
}

export async function capturePayPalOrder(payload) {
  const response = await axios.post(`${API_URL}/payments/paypal/capture-order`, payload);
  return response.data;
}

export async function cancelPayPalOrder(payload) {
  const response = await axios.post(`${API_URL}/payments/paypal/cancel-order`, payload);
  return response.data;
}

export async function getPayPalOrderStatus(orderId) {
  const response = await axios.get(`${API_URL}/payments/paypal/status/${orderId}`);
  return response.data;
}

