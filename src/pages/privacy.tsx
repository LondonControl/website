/* eslint-disable import/no-extraneous-dependencies */
import type { NextPage } from 'next';
import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

import Meta from '@/components/Meta';
import MainLayout from '@/layouts/Main';
import { AppConfig } from '@/utils/AppConfig';

// This is a workaround of
// 'pdfjs-dist/build/pdf.worker.min.js',
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  '../../node_modules/pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

interface Props {}

const Privacy: NextPage<Props> = () => {
  const [pageNumber, setPageNumber] = useState(1);

  // eslint-disable-next-line @typescript-eslint/no-shadow
  function onItemClick({ pageNumber }: { pageNumber: any }) {
    setPageNumber(pageNumber);
  }

  return (
    <MainLayout
      meta={
        <Meta
          title={`Privacy | ${AppConfig.site_name}`}
          description={AppConfig.description}
        />
      }
    >
      <div className="mx-auto max-w-site px-4 py-6 tablet:px-6 laptop:px-8">
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-gray-900 tablet:text-3xl">
          Privacy
        </h1>

        <div className="mx-auto mt-6 laptop:mt-12">
          <Document
            file="/assets/pdfs/lc_privacy_policy.pdf"
            onItemClick={onItemClick}
          >
            <Page pageNumber={pageNumber || 1} />
          </Document>
        </div>
      </div>
    </MainLayout>
  );
};

export default Privacy;
