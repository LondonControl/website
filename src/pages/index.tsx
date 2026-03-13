import type { NextPage } from 'next';

import Meta from '@/components/Meta';
import CTASection from '@/components/Sections/CTASection';
import FAQSection from '@/components/Sections/FAQSection';
import FeaturesSection from '@/components/Sections/FeaturesSection';
import HeroSection from '@/components/Sections/HeroSection';
import MainStatsSection from '@/components/Sections/MainStatsSection';
import PricingSection from '@/components/Sections/PricingSection';
import TestimonialsSection from '@/components/Sections/TestimonialsSection';
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
          canonical={`${AppConfig.site_url}`}
        />
      }
    >
      <HeroSection />

      <MainStatsSection />

      <FeaturesSection />

      <FAQSection />

      <PricingSection />

      <TestimonialsSection />

      <CTASection />
    </MainLayout>
  );
};

export default Index;
