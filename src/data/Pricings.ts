import type Pricing from '@/interfaces/Pricing';

const Pricings: Pricing[] = [
  {
    name: 'Base Installer and AIRAC Data Package',
    price: '£39.95',
    description: 'Everything necessary to get started plus up-to-date data.',
    features: [
      'London Control software',
      '2023 update',
      'Updates until 31st December 2024',
      'Updated following AIRAC dates',
    ],
    isAvailable: true,
  },
  {
    name: 'AIRAC Data Package',
    price: '£36.95',
    description: 'The latest data package for London Control.',
    features: [
      '2023 update',
      'Updates until 31st December 2024',
      'Updated following AIRAC dates',
    ],
    isAvailable: true,
  },
  {
    name: 'Standalone AIRAC Data',
    price: '£24.95',
    description: 'The latest AIRAC data for London Control.',
    features: ['2023 update', 'Latest AIRAC data'],
    isAvailable: true,
  },
];

export default Pricings;
