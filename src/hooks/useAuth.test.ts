import { act, renderHook } from '@testing-library/react';

import axios, { csrf } from '@/lib/axios';

import { useAuth } from './useAuth';

jest.mock('@/lib/axios', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), delete: jest.fn() },
  csrf: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('swr', () =>
  jest.fn(() => ({ data: undefined, error: undefined, mutate: jest.fn() })),
);

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (csrf as jest.Mock).mockResolvedValue(undefined);
  });

  it('register rejects and populates errors on a 422', async () => {
    const setErrors = jest.fn();
    (axios.post as jest.Mock).mockRejectedValue({
      response: { status: 422, data: { errors: [{ detail: 'Email taken' }] } },
    });

    const { result } = renderHook(() => useAuth({ middleware: 'guest' }));

    let caughtErr: any;
    await act(async () => {
      try {
        await result.current.register({
          name: 'A',
          email: 'a@a.com',
          password: 'x',
          password_confirmation: 'x',
          setErrors,
          setStatus: jest.fn(),
        });
      } catch (e) {
        caughtErr = e;
      }
    });

    expect(caughtErr).toBeDefined();
    expect(setErrors).toHaveBeenCalledWith([{ detail: 'Email taken' }]);
  });

  it('login resolves cleanly on success and does not call setErrors', async () => {
    const setErrors = jest.fn();
    (axios.post as jest.Mock).mockResolvedValue({ data: { data: {} } });

    const { result } = renderHook(() => useAuth({ middleware: 'guest' }));

    await act(async () => {
      await result.current.login({
        email: 'a@a.com',
        password: 'x',
        remember: false,
        setErrors,
        setStatus: jest.fn(),
      });
    });

    expect(setErrors).toHaveBeenCalledWith([]);
    expect(setErrors).not.toHaveBeenCalledWith(
      expect.arrayContaining([expect.anything()]),
    );
  });

  it('rejects non-422 errors without calling setErrors with field errors', async () => {
    const setErrors = jest.fn();
    (axios.post as jest.Mock).mockRejectedValue({ response: { status: 500 } });

    const { result } = renderHook(() => useAuth({ middleware: 'guest' }));

    let caughtErr: any;
    await act(async () => {
      try {
        await result.current.login({
          email: 'a@a.com',
          password: 'x',
          remember: false,
          setErrors,
          setStatus: jest.fn(),
        });
      } catch (e) {
        caughtErr = e;
      }
    });

    expect(caughtErr).toBeDefined();
    expect(setErrors).toHaveBeenCalledWith([]); // only the initial clear
    expect(setErrors).toHaveBeenCalledTimes(1);
  });

  it('does not throw a TypeError when a network error has no response object', async () => {
    (axios.post as jest.Mock).mockRejectedValue(new Error('Network Error'));

    const { result } = renderHook(() => useAuth({ middleware: 'guest' }));

    let caughtErr: any;
    await act(async () => {
      try {
        await result.current.login({
          email: 'a@a.com',
          password: 'x',
          remember: false,
          setErrors: jest.fn(),
          setStatus: jest.fn(),
        });
      } catch (e) {
        caughtErr = e;
      }
    });

    expect(caughtErr).toBeInstanceOf(Error);
    expect(caughtErr.message).toBe('Network Error');
  });
});
