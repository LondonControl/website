import type { NextPage } from 'next';
import React, { useState } from 'react';

import Meta from '@/components/Meta';
import ActiveSessionsForm from '@/components/ProfileForms/ActiveSessionsForm';
import DeleteAccountForm from '@/components/ProfileForms/DeleteAccountForm';
import RequestDataForm from '@/components/ProfileForms/RequestDataForm';
import UpdatePasswordForm from '@/components/ProfileForms/UpdatePasswordForm';
import UpdateProfileInformationForm from '@/components/ProfileForms/UpdateProfileInformationForm';
import UpdateSettingsForm from '@/components/ProfileForms/UpdateSettingsForm';
import { useAuth } from '@/hooks/useAuth';
import MainLayout from '@/layouts/Main';
import { AppConfig } from '@/utils/AppConfig';

const Profile: NextPage = () => {
  const { user } = useAuth({ middleware: 'auth' });
  const [selectedNav, setSelectNav] = useState<string>('profile');

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
        <h1 className="text-2xl font-bold tracking-tight text-primary tablet:text-3xl laptop:mt-6">
          Profile
        </h1>

        <div className="mt-6 flex flex-col space-y-6 laptop:mt-0 laptop:flex-row laptop:space-x-12 laptop:space-y-12">
          <aside className="laptop:mt-12 laptop:block laptop:w-1/5">
            <nav className="flex space-x-2 laptop:flex-col laptop:space-x-0 laptop:space-y-1">
              <a
                onClick={() => setSelectNav('profile')}
                className={`inline-flex h-9 items-center justify-start whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors hover:cursor-pointer hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${selectedNav === 'profile' ? 'bg-muted hover:bg-muted' : 'hover:bg-transparent hover:underline'}`}
              >
                Profile
              </a>

              <a
                onClick={() => setSelectNav('account')}
                className={`inline-flex h-9 items-center justify-start whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors hover:cursor-pointer hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${selectedNav === 'account' ? 'bg-muted hover:bg-muted' : 'hover:bg-transparent hover:underline'}`}
              >
                Account
              </a>

              <a
                onClick={() => setSelectNav('notifications')}
                className={`inline-flex h-9 items-center justify-start whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors hover:cursor-pointer hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${selectedNav === 'notifications' ? 'bg-muted hover:bg-muted' : 'hover:bg-transparent hover:underline'}`}
              >
                Notifications
              </a>
            </nav>
          </aside>

          <div className="flex-1 space-y-6 laptop:ml-8">
            {selectedNav === 'profile' && (
              <div className="rounded-md border bg-white p-4 tablet:p-8">
                <div>
                  <UpdateProfileInformationForm />
                </div>
              </div>
            )}

            {selectedNav === 'account' && (
              <>
                <div className="rounded-md border bg-white p-4 tablet:p-8">
                  <div>
                    <UpdatePasswordForm />
                  </div>
                </div>

                <div className="rounded-md border bg-white p-4 tablet:p-8">
                  <div>
                    <ActiveSessionsForm />
                  </div>
                </div>

                <div className="rounded-md border bg-white p-4 tablet:p-8">
                  <div>
                    <RequestDataForm />
                  </div>
                </div>

                <div className="rounded-md border bg-white p-4 tablet:p-8">
                  <div>
                    <DeleteAccountForm />
                  </div>
                </div>
              </>
            )}

            {selectedNav === 'notifications' && (
              <div className="rounded-md border bg-white p-4 tablet:p-8">
                <div>
                  <UpdateSettingsForm />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
