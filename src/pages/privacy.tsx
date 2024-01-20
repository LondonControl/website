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
  import.meta.url
).toString();

interface Props {}

const Privacy: NextPage<Props> = () => {
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
          title={`Privacy | ${AppConfig.site_name}`}
          description={AppConfig.description}
        />
      }
    >
      <div className="mx-auto max-w-site px-4 py-6 tablet:px-6 laptop:px-8">
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-gray-900 tablet:text-3xl">
          Privacy
        </h1>

        <div ref={observe} className="mx-auto mt-6 laptop:mt-12">
          <Document
            file="/assets/pdfs/lc_privacy_policy.pdf"
            onLoadSuccess={onDocumentLoadSuccess}
            className="group relative"
          >
            <Page
              pageNumber={pageNumber || 1}
              width={width}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />

            <div className="absolute bottom-[5%] left-[50%] translate-x-[-50%] rounded-md bg-white text-white opacity-0 shadow-sm group-hover:cursor-pointer group-hover:bg-[#191b1c] group-hover:opacity-100">
              <button
                disabled={pageNumber <= 1}
                onClick={() => setPageNumber(pageNumber - 1)}
                type="button"
                aria-label="Previous page"
                className="bg-opacity/5 h-11 w-11 border-r-0 hover:rounded-l-sm hover:bg-[#333333]"
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
                className="bg-opacity/5 h-11 w-11 border-l-0 hover:rounded-r-sm hover:bg-[#333333]"
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

export default Privacy;

// .page-controls {
//   position: absolute;
//   bottom: 5%;
//   left: 50%;
//   background: white;
//   opacity: 0;
//   transform: translateX(-50%);
//   transition: opacity ease-in-out 0.2s;
//   .shadow();
//   .rounded-corners();

//   button {
//     width: 44px;
//     height: 44px;
//     background: white;
//     border: 0;
//     font: inherit;
//     font-size: .8em;
//     .rounded-corners();

//     &:enabled {
//       &:hover {
//         cursor: pointer;
//       }

//       &:hover, &:focus {
//         background-color: #e6e6e6;
//       }
//     }

//     &:first-child {
//       border-top-right-radius: 0;
//       border-bottom-right-radius: 0;
//     }

//     &:last-child {
//       border-top-left-radius: 0;
//       border-bottom-left-radius: 0;
//     }
//   }
// }
