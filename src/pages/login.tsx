import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { FormEventHandler } from 'react';
import React, { useEffect, useState } from 'react';

import AuthCard from '@/components/Auth/AuthCard';
import AuthSessionStatus from '@/components/Auth/AuthSessionStatus';
import PrimaryButton from '@/components/Buttons/PrimaryButton';
import Checkbox from '@/components/Inputs/Checkbox';
import Input from '@/components/Inputs/Input';
import InputError from '@/components/Inputs/InputError';
import Label from '@/components/Inputs/Label';
import Meta from '@/components/Meta';
import { useAuth } from '@/hooks/useAuth';
import GuestLayout from '@/layouts/Guest';
import { AppConfig } from '@/utils/AppConfig';

const Login: NextPage = () => {
  const { query } = useRouter();

  const { login } = useAuth({
    middleware: 'guest',
    redirectUri: '/',
  });

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [shouldRemember, setShouldRemember] = useState(false);
  const [errors, setErrors] = useState<any>([]);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const reset = query && query.reset ? (query.reset as string) : '';
    if (reset.length > 0 && errors.length === 0) {
      setStatus(atob(reset));
    } else {
      setStatus(null);
    }
  });

  const submitForm: FormEventHandler = async (event) => {
    event.preventDefault();

    login({
      email,
      password,
      remember: shouldRemember,
      setErrors,
      setStatus,
    });
  };

  return (
    <GuestLayout>
      <Meta
        title={`Login | ${AppConfig.site_name}`}
        description={AppConfig.description}
      />

      <AuthCard>
        {/* Session Status */}
        <AuthSessionStatus className="mb-4" status={status} />

        <form onSubmit={submitForm}>
          {/* Email Address */}
          <div>
            <Label htmlFor="email">Email</Label>

            <Input
              id="email"
              type="email"
              value={email}
              className="mt-1 block w-full"
              onChange={(event) => setEmail(event.target.value)}
              required
              isFocused={true}
            />

            <InputError messages={errors} className="mt-2" />
          </div>

          {/* Password */}
          <div className="mt-4">
            <Label htmlFor="password">Password</Label>

            <Input
              id="password"
              type="password"
              value={password}
              className="mt-1 block w-full"
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
            />

            <InputError messages={errors} className="mt-2" />
          </div>

          {/* Remember Me */}
          <div className="mt-4 block">
            <label htmlFor="remember_me" className="inline-flex items-center">
              <Checkbox
                id="remember_me"
                name="remember"
                checked={shouldRemember}
                onChange={(event) => setShouldRemember(event.target.checked)}
              />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
          </div>

          <div className="mt-4 flex items-center justify-end">
            <Link
              href="/forgot-password"
              className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
            >
              Forgot your password?
            </Link>

            <PrimaryButton className="ml-4">Login</PrimaryButton>
          </div>
        </form>
      </AuthCard>
    </GuestLayout>
  );
};

export default Login;
