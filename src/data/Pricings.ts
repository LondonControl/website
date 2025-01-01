import type Pricing from '@/interfaces/Pricing';

const Pricings: Pricing[] = [
  {
    name: 'Base Installer and AIRAC Data Package',
    price: '£43.95',
    description: 'Everything necessary to get started plus up-to-date data.',
    features: [
      'London Control software',
      'Latest update',
      'Updates until 31st December 2025',
      'Updated quarterly or sooner if required',
    ],
    isAvailable: true,
  },
  {
    name: 'AIRAC Data Package',
    price: '£40.65',
    description: 'The latest data package for London Control.',
    features: [
      'Latest update',
      'Updates until 31st December 2025',
      'Updated quarterly or sooner if required',
    ],
    isAvailable: true,
  },
];

export default Pricings;
