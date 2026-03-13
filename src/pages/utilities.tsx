/* eslint-disable import/no-extraneous-dependencies */
import type { NextPage } from 'next';
import { useEffect } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';

import CardGrid from '@/components/CardGrid';
import Meta from '@/components/Meta';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import type Utility from '@/interfaces/Utility';
import MainLayout from '@/layouts/Main';
import axios, { fetcher } from '@/lib/axios';
import { AppConfig } from '@/utils/AppConfig';
import { getUtilitiesEndpoint } from '@/utils/Endpoints';

interface Props {}

const Utilities: NextPage<Props> = () => {
  const { data, error, isLoading } = useSWR(
    getUtilitiesEndpoint('?paginate=none'),
    fetcher,
  );

  useEffect(() => {
    if (error) toast.error('Failed to load utilities. Please try again.');
  }, [error]);

  const handleDownloadFile = async (event: any, utilityId: String) => {
    event.preventDefault();

    await axios
      .get(`/api/utilities/${utilityId}/download`)
      .then((res) => {
        window.open(res.data.data, '_blank');
      })
      .catch(() => {
        toast.error('Something went wrong');
      });
  };

  return (
    <MainLayout
      meta={
        <Meta
          title={`Utilities | ${AppConfig.site_name}`}
          description={AppConfig.description}
          canonical={`${AppConfig.site_url}/utilities`}
        />
      }
    >
      <div className="mx-auto max-w-site px-4 py-12 tablet:px-6 laptop:px-8">
        <PageHeader eyebrow="Tools" title="Utilities" />
        <h2 className="sr-only">Utilities</h2>

        <CardGrid isLoading={isLoading}>
          {data?.data.map((utility: Utility) => (
            <div
              key={utility.id}
              className="flex flex-col rounded-xl border border-border bg-card p-6 transition-shadow duration-200 hover:shadow-md"
            >
              <div className="grow">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Utility
                </p>
                <h3 className="mt-2 text-sm font-semibold leading-snug text-foreground">
                  {utility.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {utility.description}
                </p>
              </div>

              <div className="mt-6">
                <Button
                  type="button"
                  className="w-full"
                  onClick={(event) =>
                    handleDownloadFile(event, utility?.id || '')
                  }
                >
                  Download
                </Button>
              </div>
            </div>
          ))}
        </CardGrid>
      </div>
    </MainLayout>
  );
};

export default Utilities;
