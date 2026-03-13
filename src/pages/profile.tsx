import type { NextPage } from 'next';
import React, { useEffect, useState } from 'react';

import Meta from '@/components/Meta';
import ActiveSessionsForm from '@/components/ProfileForms/ActiveSessionsForm';
import DeleteAccountForm from '@/components/ProfileForms/DeleteAccountForm';
import RequestDataForm from '@/components/ProfileForms/RequestDataForm';
import UpdatePasswordForm from '@/components/ProfileForms/UpdatePasswordForm';
import UpdateProfileInformationForm from '@/components/ProfileForms/UpdateProfileInformationForm';
import UpdateSettingsForm from '@/components/ProfileForms/UpdateSettingsForm';
import ProfileSection from '@/components/ProfileSection';
import { useAuth } from '@/hooks/useAuth';
import MainLayout from '@/layouts/Main';
import { AppConfig } from '@/utils/AppConfig';

const SECTIONS = [
  { id: 'profile', label: 'Profile' },
  { id: 'password', label: 'Password' },
  { id: 'sessions', label: 'Sessions' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'data', label: 'Data' },
  { id: 'delete', label: 'Delete Account' },
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];

const SIDEBAR_GROUPS = [
  {
    label: 'Account',
    items: ['profile', 'password'] as SectionId[],
  },
  {
    label: 'Security',
    items: ['sessions'] as SectionId[],
  },
  {
    label: 'Preferences',
    items: ['notifications', 'data'] as SectionId[],
  },
  {
    label: 'Danger Zone',
    items: ['delete'] as SectionId[],
  },
];

const Profile: NextPage = () => {
  const { user } = useAuth({ middleware: 'auth' });
  const [active, setActive] = useState<SectionId>('profile');

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) setActive(id);
        },
        { rootMargin: '-100px 0px -72% 0px', threshold: 0 },
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  if (!user) return null;

  return (
    <MainLayout
      meta={
        <Meta
          title={`Profile | ${AppConfig.site_name}`}
          description={AppConfig.description}
          canonical={`${AppConfig.site_url}/profile`}
        />
      }
    >
      {/* User header strip */}
      <div className="bg-primary">
        <div className="mx-auto max-w-site px-4 py-12 tablet:px-6 laptop:px-8">
          <span className="text-xs font-medium uppercase tracking-[0.25em] text-primary-foreground/50">
            Account
          </span>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-primary-foreground tablet:text-5xl">
            {user.name}
          </h1>
          <p className="mt-2 font-jetbrains text-sm text-primary-foreground/50">
            {user.email}
          </p>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="border-b border-border laptop:hidden">
        <div className="mx-auto max-w-site px-4 tablet:px-6">
          <nav className="-mb-px flex overflow-x-auto">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  active === s.id
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                }`}
              >
                {s.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Main layout */}
      <div className="mx-auto max-w-site px-4 tablet:px-6 laptop:px-8">
        <div className="laptop:flex laptop:gap-12">
          {/* Sticky sidebar */}
          <aside className="hidden w-52 shrink-0 laptop:block">
            <nav className="sticky top-[88px] space-y-6 pb-16 pt-10">
              {SIDEBAR_GROUPS.map((group) => (
                <div key={group.label}>
                  <p className="mb-1 px-3 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground/60">
                    {group.label}
                  </p>
                  <div className="space-y-0.5">
                    {group.items.map((id) => {
                      const section = SECTIONS.find((s) => s.id === id)!;
                      return (
                        <a
                          key={id}
                          href={`#${id}`}
                          className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                            active === id
                              ? 'bg-secondary font-medium text-foreground'
                              : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                          }`}
                        >
                          {section.label}
                        </a>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </aside>

          {/* Scrollable content */}
          <div className="min-w-0 flex-1">
            <ProfileSection id="profile" title="Profile Information" first>
              <UpdateProfileInformationForm />
            </ProfileSection>

            <ProfileSection id="password" title="Update Password">
              <UpdatePasswordForm />
            </ProfileSection>

            <ProfileSection id="sessions" title="Active Sessions">
              <ActiveSessionsForm />
            </ProfileSection>

            <ProfileSection id="notifications" title="Notifications">
              <UpdateSettingsForm />
            </ProfileSection>

            <ProfileSection id="data" title="Download Data">
              <RequestDataForm />
            </ProfileSection>

            <ProfileSection id="delete" title="Delete Account" danger>
              <DeleteAccountForm />
            </ProfileSection>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
