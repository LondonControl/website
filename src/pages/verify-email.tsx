/* eslint-disable import/no-extraneous-dependencies */
import type { NextPage } from 'next';
import React, { useState } from 'react';
import { toast } from 'sonner';

import AuthCard from '@/components/Auth/AuthCard';
import AuthSessionStatus from '@/components/Auth/AuthSessionStatus';
import Meta from '@/components/Meta';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import GuestLayout from '@/layouts/Guest';
import { AppConfig } from '@/utils/AppConfig';

const VerifyEmail: NextPage = () => {
  const { logout, resendEmailVerification } = useAuth({
    middleware: 'auth',
    redirectUri: '/',
  });

  const [status, setStatus] = useState<string | null>(null);

  return (
    <GuestLayout>
      <Meta
        title={`Verify Email | ${AppConfig.site_name}`}
        description={AppConfig.description}
        canonical={`${AppConfig.site_url}/verify-email`}
      />

      <AuthCard
        title="Check your inbox"
        description="We've sent a verification link to your email address."
      >
        <AuthSessionStatus className="mb-6" status={status} />

        <p className="text-sm leading-relaxed text-muted-foreground">
          Before getting started, please verify your email address by clicking
          the link we just sent you. If you didn&apos;t receive it, we can send
          another.
        </p>

        <Button
          className="mt-6 w-full"
          onClick={() => {
            resendEmailVerification({
              setStatus,
              setErrors: () => {},
            });
            toast.success('Verification email sent successfully');
          }}
        >
          Resend verification email
        </Button>

        <p className="mt-4 text-sm text-muted-foreground">
          Wrong account?{' '}
          <Button
            variant="link"
            className="h-auto p-0 text-sm"
            onClick={logout}
          >
            Logout
          </Button>
        </p>
      </AuthCard>
    </GuestLayout>
  );
};

export default VerifyEmail;
