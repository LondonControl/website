import type { NextPage } from 'next';
import React from 'react';

import Meta from '@/components/Meta';
import MainLayout from '@/layouts/Main';
import { AppConfig } from '@/utils/AppConfig';

import UpdatePasswordForm from './partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './partials/UpdateProfileInformationForm';

const Profile: NextPage = () => {
  return (
    <MainLayout
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Profile
        </h2>
      }
      meta={
        <Meta
          title={`Profile | ${AppConfig.site_name}`}
          description={AppConfig.description}
        />
      }
    >
      <div className="py-12">
        <div className="mx-auto max-w-site space-y-6 tablet:px-6 laptop:px-8">
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
