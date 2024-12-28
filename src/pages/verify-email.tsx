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

      <AuthCard>
        <div className="mb-4 text-sm text-muted-foreground">
          Thanks for signing up! Before getting started, could you verify your
          email address by clicking on the link we just emailed to you? If you
          didn&apos;t receive the email, we will gladly send you another.
        </div>

        {status === 'verification-link-sent' && (
          <AuthSessionStatus
            className="mb-4"
            status="A new verification link has been sent to the email
                        address you provided during registration"
          />
        )}

        <div className="mt-4 flex items-center justify-end">
          <div className="justify-between">
            <Button
              onClick={() => {
                resendEmailVerification({
                  setStatus,
                  setErrors: () => {},
                });

                toast.success('Verification email sent successfully');
              }}
            >
              Resend Verification Email
            </Button>

            <Button
              type="button"
              className="text-sm text-gray-600 underline hover:text-primary"
              onClick={logout}
            >
              Logout
            </Button>
          </div>
        </div>
      </AuthCard>
    </GuestLayout>
  );
};

export default VerifyEmail;
