import type { NextPage } from 'next';
import type { FormEventHandler } from 'react';
import React, { useState } from 'react';

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

const ForgotPassword: NextPage = () => {
  const { forgotPassword } = useAuth({
    middleware: 'guest',
    redirectUri: '/dashboard',
  });

  const [email, setEmail] = useState<string>('');
  const [errors, setErrors] = useState<any>([]);
  const [status, setStatus] = useState(null);

  const submitForm: FormEventHandler = (event) => {
    event.preventDefault();

    forgotPassword({ email, setErrors, setStatus });
  };

  return (
    <GuestLayout>
      <Meta
        title={`Forgot Password | ${AppConfig.site_name}`}
        description={AppConfig.description}
      />

      <AuthCard>
        <div className="mb-4 text-sm text-gray-600">
          Forgot your password? No problem. Just let us know your email address
          and we will email you a password reset link that will allow you to
          choose a new one.
        </div>

        {/* Session Status */}
        <AuthSessionStatus className="mb-4" status={status} />

        <form onSubmit={submitForm}>
          {/* Email Address */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              value={email}
              className="mt-1 block w-full"
              onChange={(event) => setEmail(event.target.value)}
              required
              autoFocus
            />

            <InputError messages={errors.email} className="mt-2" />
          </div>

          <div className="mt-4 flex items-center justify-end">
            <PrimaryButton>Email Password Reset Link</PrimaryButton>
          </div>
        </form>
      </AuthCard>
    </GuestLayout>
  );
};

export default ForgotPassword;
