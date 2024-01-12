import type { NextPage } from 'next';
import React from 'react';

import Meta from '@/components/Meta';
import { useAuth } from '@/hooks/useAuth';
import MainLayout from '@/layouts/Main';
import { AppConfig } from '@/utils/AppConfig';

import UpdatePasswordForm from './partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './partials/UpdateProfileInformationForm';

const Profile: NextPage = () => {
  const { user } = useAuth({ middleware: 'auth' });

  if (!user) return null;

  return (
    <MainLayout
      meta={
        <Meta
          title={`Profile | ${AppConfig.site_name}`}
          description={AppConfig.description}
        />
      }
    >
      <div className="mx-auto max-w-site px-4 py-6 tablet:px-6 laptop:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 tablet:text-3xl laptop:mt-6">
          Profile
        </h1>

        <div className="mt-6 space-y-6 laptop:mt-12">
          <div className="border bg-white p-4 tablet:rounded-lg tablet:p-8">
            <div className="max-w-xl">
              <UpdateProfileInformationForm />
            </div>
          </div>

          <div className="border bg-white p-4 tablet:rounded-lg tablet:p-8">
            <div className="max-w-xl">
              <UpdatePasswordForm />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
