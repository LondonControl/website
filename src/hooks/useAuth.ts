import { useRouter } from 'next/router';
import { useEffect } from 'react';
import useSWR from 'swr';

import type User from '@/interfaces/User';
import axios, { csrf } from '@/lib/axios';
import { getUserEndpoint } from '@/utils/Endpoints';

declare type AuthMiddleware = 'auth' | 'guest';

interface UseAuth {
  middleware: AuthMiddleware;
  redirectUri?: string;
}

interface ApiRequest {
  setErrors: React.Dispatch<React.SetStateAction<never[]>>;
  setStatus: React.Dispatch<React.SetStateAction<any | null>>;
  [key: string]: any;
}

export const useAuth = ({ middleware, redirectUri }: UseAuth) => {
  const router = useRouter();

  const {
    data: user,
    error,
    mutate,
  } = useSWR<User>(getUserEndpoint(), () =>
    axios
      .get(getUserEndpoint())
      .then((res) => res.data)
      .catch((err) => {
        if (err.response.status !== 409) throw err;

        router.push('/verify-email');
      })
  );

  const register = async (args: ApiRequest) => {
    const { setErrors, ...props } = args;

    await csrf();

    setErrors([]);

    axios
      .post('/register', props)
      .then(() => mutate())
      .catch((err) => {
        if (err.response.status !== 422) throw err;

        setErrors(err.response.data.errors);
      });
  };

  const login = async (args: ApiRequest) => {
    const { setErrors, setStatus, ...props } = args;

    await csrf();

    setErrors([]);
    setStatus(null);

    axios
      .post('/login', props)
      .then(() => mutate())
      .catch((err) => {
        if (err.response.status !== 422) throw err;

        setErrors(err.response.data.errors);
      });
  };

  const forgotPassword = async (args: ApiRequest) => {
    const { setErrors, setStatus, email } = args;
    await csrf();

    setErrors([]);
    setStatus(null);

    axios
      .post('/forgot-password', { email })
      .then((response) => setStatus(response.data.status))
      .catch((err) => {
        if (err.response.status !== 422) throw err;

        setErrors(err.response.data.errors);
      });
  };

  const resetPassword = async (args: ApiRequest) => {
    const { setErrors, setStatus, ...props } = args;
    await csrf();

    setErrors([]);
    setStatus(null);

    axios
      .post('/reset-password', { token: router.query.token, ...props })
      .then((response) =>
        router.push(`/login?reset=${btoa(response.data.status)}`)
      )
      .catch((err) => {
        if (err.response.status !== 422) throw err;

        setErrors(err.response.data.errors);
      });
  };

  const resendEmailVerification = (args: ApiRequest) => {
    const { setStatus } = args;

    axios
      .post('/email/verification-notification')
      .then((response) => setStatus(response.data.status));
  };

  const logout = async () => {
    if (!error) {
      await axios.post('/logout').then(() => mutate());
    }

    window.location.pathname = '/login';
  };

  useEffect(() => {
    if (middleware === 'guest' && redirectUri && user) router.push(redirectUri);

    if (window.location.pathname === '/verify-email' && user?.email_verified_at)
      // This is to stop ts complaining.
      router.push(redirectUri ?? '');

    if (middleware === 'auth' && error) logout();
  }, [user, error]);

  return {
    user,
    register,
    login,
    forgotPassword,
    resetPassword,
    resendEmailVerification,
    logout,
  };
};
