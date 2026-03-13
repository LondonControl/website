/* eslint-disable import/no-extraneous-dependencies */
import type { NextPage } from 'next';
import { toast } from 'sonner';
import useSWR from 'swr';

import CardGrid from '@/components/CardGrid';
import Meta from '@/components/Meta';
import PageHeader from '@/components/PageHeader';
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

  if (error) toast.error('Something went wrong, please try again!');

  const handleDownloadFile = async (productId: string) => {
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
          canonical={`${AppConfig.site_url}/documents`}
        />
      }
    >
      <div className="mx-auto max-w-site px-4 py-12 tablet:px-6 laptop:px-8">
        <PageHeader eyebrow="Resources" title="Documents" />
        <h2 className="sr-only">Documents</h2>

        <CardGrid isLoading={isLoading}>
          {data?.data.map((document: Document) => (
            <div
              key={document.id}
              className="flex flex-col rounded-xl border border-border bg-card p-6 transition-shadow duration-200 hover:shadow-md"
            >
              <div className="grow">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Document
                </p>
                <h3 className="mt-2 text-sm font-semibold leading-snug text-foreground">
                  {document.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {document.description}
                </p>
              </div>

              <div className="mt-6">
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => handleDownloadFile(document?.id || '')}
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

export default Documents;
