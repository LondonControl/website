/* eslint-disable import/no-extraneous-dependencies */
import type { NextPage } from 'next';
import { useState } from 'react';
import useDimensions from 'react-cool-dimensions';
import { Document, Page, pdfjs } from 'react-pdf';

import Meta from '@/components/Meta';
import MainLayout from '@/layouts/Main';
import { AppConfig } from '@/utils/AppConfig';

// This is a workaround of
// 'pdfjs-dist/build/pdf.worker.min.js',
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  '../../node_modules/pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

interface Props {}

const Terms: NextPage<Props> = () => {
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const { observe, width } = useDimensions();

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setTotalPages(numPages);
    setPageNumber(1);
  }

  return (
    <MainLayout
      meta={
        <Meta
          title={`Terms and Conditions | ${AppConfig.site_name}`}
          description={AppConfig.description}
          canonical={`${AppConfig.site_url}/terms`}
        />
      }
    >
      <div className="mx-auto max-w-site px-4 py-12 tablet:px-6 laptop:px-8">
        <div className="border-b border-border pb-8">
          <span className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
            Legal
          </span>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground tablet:text-4xl">
            Terms and Conditions
          </h1>
        </div>

        <div ref={observe} className="mx-auto mt-8">
          <Document
            file="/assets/pdfs/lc_terms_and_conditions.pdf"
            onLoadSuccess={onDocumentLoadSuccess}
            className="group relative"
          >
            <Page
              pageNumber={pageNumber || 1}
              width={width}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />

            <div className="absolute bottom-[5%] left-[50%] translate-x-[-50%] rounded-md bg-primary text-primary-foreground opacity-0 shadow-sm group-hover:cursor-pointer group-hover:opacity-100">
              <button
                disabled={pageNumber <= 1}
                onClick={() => setPageNumber(pageNumber - 1)}
                type="button"
                aria-label="Previous page"
                className="size-11 border-r-0 hover:rounded-l-sm hover:bg-primary-foreground/10"
              >
                ‹
              </button>

              <span className="px-3 py-2">
                {pageNumber} of {totalPages}
              </span>

              <button
                disabled={pageNumber >= totalPages}
                onClick={() => setPageNumber(pageNumber + 1)}
                type="button"
                aria-label="Next page"
                className="size-11 border-l-0 hover:rounded-r-sm hover:bg-primary-foreground/10"
              >
                ›
              </button>
            </div>
          </Document>
        </div>
      </div>
    </MainLayout>
  );
};

export default Terms;
