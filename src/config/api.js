const BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/api`;

export const API_CONFIG = {
  BASE_URL,
  ITEMS_LIST: `${BASE_URL}/items`,
  ORDERS: `${BASE_URL}/orders`,
  ORDERS_PAYMENT_APPROVE: (orderId) => `${BASE_URL}/orders/${orderId}/payments`,
  ORDER_DETAIL: (orderId) => `${BASE_URL}/orders/${orderId}`,
  SESSIONS: `${BASE_URL}/sessions`,
};