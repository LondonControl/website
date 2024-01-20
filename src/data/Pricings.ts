import type Pricing from '@/interfaces/Pricing';

const Pricings: Pricing[] = [
  {
    name: 'Base Installer and 2023 Update',
    price: '£39.95',
    description: 'Everything necessary to get started plus up-to-date data.',
    features: [
      'London Control software',
      '2023 update',
      'Updates until 31st December 2024',
    ],
    isAvailable: true,
  },
  {
    name: '2023 Data Package',
    price: '£34.95',
    description: 'The latest data package for London Control.',
    features: ['2023 update', 'Updates until 31st December 2024'],
    isAvailable: true,
  },
  {
    name: 'Standalone Data Package',
    price: '£24.95',
    description: 'The latest data package for London Control.',
    features: ['2023 update'],
    isAvailable: true,
  },
];

export default Pricings;
