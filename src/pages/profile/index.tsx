import type { NextPage } from 'next';
import React from 'react';

import Meta from '@/components/Meta';
import { useAuth } from '@/hooks/useAuth';
import MainLayout from '@/layouts/Main';
import { AppConfig } from '@/utils/AppConfig';

import DeleteAccountForm from './partials/DeleteAccountForm';
import UpdatePasswordForm from './partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './partials/UpdateProfileInformationForm';
import UpdateSettingsForm from './partials/UpdateSettingsForm';

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

        <div className="flex flex-row">
          <aside className="hidden laptop:mt-12 laptop:block laptop:w-1/5">
            <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
              <a className="inline-flex h-9 items-center justify-start whitespace-nowrap rounded-md bg-muted px-4 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                Profile
              </a>
              {/* <a className="inline-flex h-9 items-center justify-start whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-transparent hover:text-accent-foreground hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                Account
              </a>
              <a className="inline-flex h-9 items-center justify-start whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-transparent hover:text-accent-foreground hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                Notifications
              </a> */}
            </nav>
          </aside>

          <div className="mt-6 flex-1 space-y-6 laptop:ml-8 laptop:mt-12">
            <div className="border bg-white p-4 tablet:rounded-lg tablet:p-8">
              <div className="max-w-2xl">
                <UpdateProfileInformationForm />
              </div>
            </div>

            <div className="border bg-white p-4 tablet:rounded-lg tablet:p-8">
              <div className="max-w-2xl">
                <UpdatePasswordForm />
              </div>
            </div>

            <div className="border bg-white p-4 tablet:rounded-lg tablet:p-8">
              <div className="max-w-2xl">
                <UpdateSettingsForm />
              </div>
            </div>

            <div className="border bg-white p-4 tablet:rounded-lg tablet:p-8">
              <div className="max-w-2xl">
                <DeleteAccountForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
