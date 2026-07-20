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
      .then((res) => res.data.data)
      .catch((err) => {
        if (err.response?.status !== 409) throw err;

        router.push('/verify-email');
      }),
  );

  const register = async (args: ApiRequest) => {
    const { setErrors, ...props } = args;

    await csrf();

    setErrors([]);

    try {
      await axios.post('/register', {
        name: props.name,
        email: props.email,
        password: props.password,
        password_confirmation: props.password_confirmation,
      });

      await mutate();
    } catch (err: any) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
      }

      throw err;
    }
  };

  const login = async (args: ApiRequest) => {
    const { setErrors, setStatus, ...props } = args;

    await csrf();

    setErrors([]);
    setStatus(null);

    try {
      await axios.post('/login', {
        email: props.email,
        password: props.password,
        remember: props.remember,
      });

      await mutate();
    } catch (err: any) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
      }

      throw err;
    }
  };

  const forgotPassword = async (args: ApiRequest) => {
    const { setErrors, setStatus, email } = args;
    await csrf();

    setErrors([]);
    setStatus(null);

    try {
      const response = await axios.post('/forgot-password', { email });

      setStatus(response.data.status);
    } catch (err: any) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
      }

      throw err;
    }
  };

  const resetPassword = async (args: ApiRequest) => {
    const { setErrors, setStatus, ...props } = args;
    await csrf();

    setErrors([]);
    setStatus(null);

    try {
      const response = await axios.post('/reset-password', {
        token: router.query.token,
        ...props,
      });

      router.push(`/login?reset=${btoa(response.data.status)}`);
    } catch (err: any) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
      }

      throw err;
    }
  };

  const resendEmailVerification = (args: ApiRequest) => {
    const { setStatus } = args;

    axios
      .post('/email/verification-notification')
      .then((response) => setStatus(response.data.status));
  };

  const logout = async () => {
    await axios.post('/logout').then(() => mutate());

    window.location.pathname = '/login';
  };

  const deleteAccount = async (args: ApiRequest) => {
    const { setErrors } = args;
    await csrf();

    setErrors([]);

    try {
      await axios.delete('/api/user');

      mutate();
      window.location.pathname = '/';
    } catch (err: any) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
      }

      throw err;
    }
  };

  useEffect(() => {
    if (middleware === 'guest' && redirectUri && user) router.push(redirectUri);
    // if (middleware === 'auth' && redirectUri && user) router.push(redirectUri);
    if (middleware === 'auth' && !user) router.push('/login');
    if (middleware === 'auth' && error) logout();

    if (window.location.pathname === '/verify-email' && user?.email_verified_at)
      // This is to stop ts complaining.
      router.push(redirectUri ?? '/');
  }, [user, error]);

  return {
    user,
    register,
    login,
    forgotPassword,
    resetPassword,
    resendEmailVerification,
    logout,
    deleteAccount,
  };
};
