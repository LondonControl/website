import type Pricing from '@/interfaces/Pricing';

const Pricings: Pricing[] = [
  {
    name: 'Base Installer & 2023 Update',
    href: '/products/base-installer',
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
    href: '#',
    price: '£34.95',
    description: 'The latest data package for London Control.',
    features: ['2023 update', 'Updates until 31st December 2024'],
    isAvailable: true,
  },
  {
    name: 'Subsequent Data Package',
    href: '#',
    price: '£24.95',
    description: 'The latest data patch for London Control.',
    features: ['XXXX update'],
    isAvailable: false,
  },
];

export default Pricings;
