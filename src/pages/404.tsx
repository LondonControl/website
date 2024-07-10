import type { NextPage } from 'next';
import React from 'react';

const NotFoundPage: NextPage = () => {
  return (
    <div className="items-top relative flex min-h-screen justify-center bg-gray-100 tablet:items-center tablet:pt-0">
      <div className="mx-auto max-w-xl tablet:px-6 laptop:px-8">
        <div className="flex items-center pt-8 tablet:justify-start tablet:pt-0">
          <div className="border-r border-gray-400 px-4 text-lg tracking-wider text-muted-foreground">
            404
          </div>

          <div className="ml-4 text-lg uppercase tracking-wider text-muted-foreground">
            Not Found
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
