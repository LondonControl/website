// The easiest solution to mock `next/router`: https://github.com/vercel/next.js/issues/7479
export const useRouter = jest.fn(() => ({
  basePath: '.',
  pathname: '/',
  route: '/',
  query: {},
  asPath: '/',
  push: jest.fn().mockResolvedValue(true),
  replace: jest.fn().mockResolvedValue(true),
  back: jest.fn(),
  prefetch: jest.fn().mockResolvedValue(undefined),
  beforePopState: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  isFallback: false,
  isReady: true,
}));
