import type Pricing from '@/interfaces/Pricing';

const Pricings: Pricing[] = [
  {
    name: 'Base Installer & 2023 Update',
    href: '/products/base-installer',
    price: '£39.95',
    description: 'Everything necessary to get started plus up-to-date data.',
    features: ['London Control simulation', '2023 update'],
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
    features: ['1709 update'],
    isAvailable: false,
  },
];

export default Pricings;
