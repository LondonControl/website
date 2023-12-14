import type Pricing from '@/interfaces/Pricing';

const Pricings: Pricing[] = [
  {
    name: 'Base Installer',
    href: '/products/base-installer',
    price: '£30',
    description: 'Everything necessary to get started.',
    features: ['London Control simulation', '1709 update'],
  },
  {
    name: 'Base Installer & Data Bundle',
    href: '#',
    price: '£40',
    description: 'Everything necessary to get started plus up-to-date data.',
    features: ['London Control simulation', '1709 update'],
  },
  {
    name: 'Data Pack',
    href: '#',
    price: '£15',
    description: 'The latest data patch for London Control.',
    features: ['1709 update'],
  },
];

export default Pricings;
