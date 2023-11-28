import type { NextPage } from 'next';

import Meta from '@/components/Meta';
import CTASection from '@/components/Sections/CTASection';
import FAQSection from '@/components/Sections/FAQSection';
import FeaturesSection from '@/components/Sections/FeaturesSection';
import HeroSection from '@/components/Sections/HeroSection';
import MainStatsSection from '@/components/Sections/MainStatsSection';
import MainLayout from '@/layouts/Main';
import { AppConfig } from '@/utils/AppConfig';

interface Props {}

const Index: NextPage<Props> = () => {
  return (
    <MainLayout
      meta={
        <Meta
          title={`${AppConfig.site_name}`}
          description={AppConfig.description}
        />
      }
    >
      {/* <div className="mx-auto max-w-site px-6 desktop:px-8 desktop:py-10">
        <h1 className="text-center text-5xl font-semibold">
          No gimmicks, just realistic ATC
        </h1>

        <PrimaryButton className="mt-12">Sign up now</PrimaryButton>

        <div className="mt-8 h-80 w-full rounded-md bg-gray-500">f</div>
      </div> */}

      <HeroSection />

      <MainStatsSection />

      <FeaturesSection />

      <FAQSection />

      <CTASection />
    </MainLayout>
  );
};

export default Index;
