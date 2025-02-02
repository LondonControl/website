export const getUserEndpoint = () => {
  return '/api/user';
};

export const getUserOrdersEndpoint = () => {
  return '/api/orders';
};

export const getUserOrderEndpoint = (orderId: string) => {
  return `/api/orders/${orderId}`;
};

export const getProductsEndpoint = (filters: string) => {
  return `/api/products${filters}`;
};

export const getNewsPostsEndpoint = (filters: string) => {
  return `/api/news-posts${filters}`;
};

export const getAnnouncementsEndpoint = (filters: string) => {
  return `/api/announcements${filters}`;
};

export const getDocumentsEndpoint = (filters: string) => {
  return `/api/documents${filters}`;
};

export const getUtilitiesEndpoint = (filters: string) => {
  return `/api/utilities${filters}`;
};
