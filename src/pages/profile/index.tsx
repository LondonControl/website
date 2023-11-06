import Head from 'next/head';
import React from 'react';

import Meta from '@/components/Meta';
import MainLayout from '@/layouts/Main';

import DeleteUserForm from './partials/DeleteUserForm';
import UpdatePasswordForm from './partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './partials/UpdateProfileInformationForm';

const Profile = () => {
  return (
    <MainLayout
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
          Profile
        </h2>
      }
      meta={
        <Meta
          title="Next.js Boilerplate Presentation"
          description="Next js Boilerplate is the perfect starter code for your project. Build your React application with the Next.js framework."
        />
      }
    >
      <Head>
        <title>Laravel - Profile</title>
      </Head>

      <div className="py-12">
        <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
          <div className="bg-white p-4 shadow dark:bg-gray-800 sm:rounded-lg sm:p-8">
            <div className="max-w-xl">
              <UpdateProfileInformationForm />
            </div>
          </div>

          <div className="bg-white p-4 shadow dark:bg-gray-800 sm:rounded-lg sm:p-8">
            <div className="max-w-xl">
              <UpdatePasswordForm />
            </div>
          </div>

          <div className="bg-white p-4 shadow dark:bg-gray-800 sm:rounded-lg sm:p-8">
            <div className="max-w-xl">
              <DeleteUserForm />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
