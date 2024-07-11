/* eslint-disable import/no-extraneous-dependencies */
import type { NextPage } from 'next';
import MoonLoader from 'react-spinners/MoonLoader';
import { toast } from 'sonner';
import useSWR from 'swr';

import Meta from '@/components/Meta';
import { Button } from '@/components/ui/button';
import type Document from '@/interfaces/Document';
import MainLayout from '@/layouts/Main';
import axios, { fetcher } from '@/lib/axios';
import { AppConfig } from '@/utils/AppConfig';
import { getDocumentsEndpoint } from '@/utils/Endpoints';

interface Props {}

const Documents: NextPage<Props> = () => {
  const { data, error, isLoading } = useSWR(
    getDocumentsEndpoint('?paginate=none&is_available=1'),
    fetcher,
  );

  // eslint-disable-next-line no-console
  if (error) console.log(error);

  const handleDownloadFile = async (event: any, productId: String) => {
    event.preventDefault();

    await axios
      .get(`/api/documents/${productId}/download`)
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
          title={`Documents | ${AppConfig.site_name}`}
          description={AppConfig.description}
        />
      }
    >
      <div className="mx-auto max-w-site px-4 py-6 tablet:px-6 laptop:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-primary tablet:text-3xl laptop:mt-6">
          Documents
        </h1>
        <h2 className="sr-only">Documents</h2>

        {isLoading ? (
          <div className="mt-6 flex items-center justify-center laptop:mt-12">
            <MoonLoader loading={isLoading} />
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-y-4 tablet:grid-cols-2 tablet:gap-x-6 tablet:gap-y-10 laptop:mt-12 laptop:grid-cols-4 laptop:gap-x-8">
            {data?.data.map((document: Document) => (
              <div
                key={document.id}
                className="flex flex-col rounded-md border border-gray-200 bg-card p-4 text-card-foreground"
              >
                <div className="grow">
                  <h3 className="text-base font-medium text-primary">
                    {document.title}
                  </h3>

                  <hr className="mt-2 border-gray-100" />

                  <p className="mt-4 text-sm text-primary">
                    {document.description}
                  </p>
                </div>

                <div className="mt-4 content-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={(event) =>
                      handleDownloadFile(event, document?.id || '')
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

export default Documents;
