import type { NextPage } from 'next';

import Meta from '@/components/Meta';
import MainLayout from '@/layouts/Main';

interface Props {}

const Index: NextPage<Props> = () => {
  return (
    <MainLayout
      meta={
        <Meta
          title="Laravel Breeze NextJS Typescript"
          description="This is a template project for using Laravel Breeze in NextJS Typescirpt."
        />
      }
    >
      <div className="desktop:px-16 mx-auto mb-6 max-w-site px-6">
        <h1>NextJS Project Boilerplate</h1>
      </div>
    </MainLayout>
  );
};

export default Index;
