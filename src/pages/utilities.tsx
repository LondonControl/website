/* eslint-disable import/no-extraneous-dependencies */
import type { NextPage } from 'next';
import MoonLoader from 'react-spinners/MoonLoader';
import { toast } from 'sonner';
import useSWR from 'swr';

import Meta from '@/components/Meta';
import { Button } from '@/components/ui/button';
import type Utility from '@/interfaces/Utility';
import MainLayout from '@/layouts/Main';
import axios, { fetcher } from '@/lib/axios';
import { AppConfig } from '@/utils/AppConfig';
import { getUtilitiesEndpoint } from '@/utils/Endpoints';

interface Props {}

const Utilities: NextPage<Props> = () => {
  const { data, error, isLoading } = useSWR(
    getUtilitiesEndpoint('?paginate=none&is_available=1'),
    fetcher,
  );

  // eslint-disable-next-line no-console
  if (error) console.log(error);

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
      <div className="mx-auto max-w-site px-4 py-6 tablet:px-6 laptop:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-primary tablet:text-3xl laptop:mt-6">
          Utilities
        </h1>
        <h2 className="sr-only">Utilities</h2>

        {isLoading ? (
          <div className="mt-6 flex items-center justify-center laptop:mt-12">
            <MoonLoader loading={isLoading} />
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-y-4 tablet:grid-cols-2 tablet:gap-x-6 tablet:gap-y-10 laptop:mt-12 laptop:grid-cols-3 laptop:gap-x-8 desktop:grid-cols-4">
            {data?.data.map((utility: Utility) => (
              <div
                key={utility.id}
                className="flex flex-col rounded-md border border-gray-200 bg-card p-4 text-card-foreground"
              >
                <div className="grow">
                  <h3 className="text-base font-medium text-primary">
                    {utility.title}
                  </h3>

                  <hr className="mt-2 border-gray-100" />

                  <p className="mt-4 text-sm text-primary">
                    {utility.description}
                  </p>
                </div>

                <div className="mt-4 content-end">
                  <Button
                    type="button"
                    variant="outline"
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
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Utilities;
