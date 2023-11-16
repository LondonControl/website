import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import type { FormEventHandler } from 'react';
import React, { useEffect, useState } from 'react';

import AuthCard from '@/components/Auth/AuthCard';
import AuthSessionStatus from '@/components/Auth/AuthSessionStatus';
import PrimaryButton from '@/components/Buttons/PrimaryButton';
import Input from '@/components/Inputs/Input';
import InputError from '@/components/Inputs/InputError';
import Label from '@/components/Inputs/Label';
import Meta from '@/components/Meta';
import { useAuth } from '@/hooks/useAuth';
import GuestLayout from '@/layouts/Guest';
import { AppConfig } from '@/utils/AppConfig';

const PasswordReset: NextPage = () => {
  const { query } = useRouter();

  const { resetPassword } = useAuth({ middleware: 'guest' });

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>('');
  const [errors, setErrors] = useState<any>([]);
  const [status, setStatus] = useState(null);

  const submitForm: FormEventHandler = (event) => {
    event.preventDefault();

    resetPassword({
      email,
      password,
      password_confirmation: passwordConfirmation,
      setErrors,
      setStatus,
    });
  };

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const email = query && query.email ? (query.email as string) : '';

    setEmail(email);
  }, [query.email]);

  return (
    <GuestLayout>
      <Meta
        title={`Reset Password | ${AppConfig.site_name}`}
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
              autoFocus
            />

            <InputError messages={errors.email} className="mt-2" />
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
            />

            <InputError messages={errors.password} className="mt-2" />
          </div>

          {/* Confirm Password */}
          <div className="mt-4">
            <Label htmlFor="passwordConfirmation">Confirm Password</Label>

            <Input
              id="passwordConfirmation"
              type="password"
              value={passwordConfirmation}
              className="mt-1 block w-full"
              onChange={(event) => setPasswordConfirmation(event.target.value)}
              required
            />

            <InputError
              messages={errors.password_confirmation}
              className="mt-2"
            />
          </div>

          <div className="mt-4 flex items-center justify-end">
            <PrimaryButton>Reset Password</PrimaryButton>
          </div>
        </form>
      </AuthCard>
    </GuestLayout>
  );
};

export default PasswordReset;
