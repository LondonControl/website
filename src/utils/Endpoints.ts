export const getUserEndpoint = () => {
  return '/api/user';
};

export const getUserOrdersEndpoint = () => {
  return '/api/orders';
};

export const getUserOrderEndpoint = (orderId: string) => {
  return `/api/orders/${orderId}`;
};
