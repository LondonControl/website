import {
  getAnnouncementsEndpoint,
  getDocumentsEndpoint,
  getNewsPostsEndpoint,
  getProductsEndpoint,
  getUserEndpoint,
  getUserOrderEndpoint,
  getUserOrdersEndpoint,
  getUtilitiesEndpoint,
} from './Endpoints';

describe('Endpoints', () => {
  describe('getUserEndpoint', () => {
    it('returns the user endpoint', () => {
      expect(getUserEndpoint()).toBe('/api/user');
    });
  });

  describe('getUserOrdersEndpoint', () => {
    it('returns the orders endpoint', () => {
      expect(getUserOrdersEndpoint()).toBe('/api/orders');
    });
  });

  describe('getUserOrderEndpoint', () => {
    it('returns an order endpoint with the given id', () => {
      expect(getUserOrderEndpoint('abc-123')).toBe('/api/orders/abc-123');
    });
  });

  describe('getProductsEndpoint', () => {
    it('returns the base endpoint without filters', () => {
      expect(getProductsEndpoint()).toBe('/api/products');
    });

    it('appends filters when provided', () => {
      expect(getProductsEndpoint('?sort=price')).toBe(
        '/api/products?sort=price',
      );
    });
  });

  describe('getNewsPostsEndpoint', () => {
    it('returns the base endpoint without filters', () => {
      expect(getNewsPostsEndpoint()).toBe('/api/news-posts');
    });

    it('appends filters when provided', () => {
      expect(getNewsPostsEndpoint('?paginate=none')).toBe(
        '/api/news-posts?paginate=none',
      );
    });
  });

  describe('getAnnouncementsEndpoint', () => {
    it('returns the base endpoint without filters', () => {
      expect(getAnnouncementsEndpoint()).toBe('/api/announcements');
    });

    it('appends filters when provided', () => {
      expect(getAnnouncementsEndpoint('?is_visible=1')).toBe(
        '/api/announcements?is_visible=1',
      );
    });
  });

  describe('getDocumentsEndpoint', () => {
    it('returns the base endpoint without filters', () => {
      expect(getDocumentsEndpoint()).toBe('/api/documents');
    });
  });

  describe('getUtilitiesEndpoint', () => {
    it('returns the base endpoint without filters', () => {
      expect(getUtilitiesEndpoint()).toBe('/api/utilities');
    });
  });
});
