import {
  BookOpen,
  FileStack,
  Mic,
  Radar,
  Settings2,
  Target,
} from 'lucide-react';

const Features = [
  {
    icon: Target,
    name: 'High fidelity simulation.',
    description:
      'Sector configurations, procedures and airspace are identical to real-world NATS operations — London, Scottish and Terminal Control, reproduced in full.',
  },
  {
    icon: Radar,
    name: 'Sophisticated radar display.',
    description:
      'A realistic situation display mirrors live NATS systems: primary and secondary radar returns, flight data displays, sector boundaries and traffic loading indicators.',
  },
  {
    icon: Mic,
    name: 'Voice recognition.',
    description:
      'Speak your clearances naturally. The integrated voice engine interprets spoken ATC instructions and triggers accurate pilot readbacks and compliance.',
  },
  {
    icon: FileStack,
    name: 'Real-world flight plans.',
    description:
      'Over 21,000 flight plans sourced from live AIRAC data give every session authentic routings, aircraft types and callsigns matching real-world traffic.',
  },
  {
    icon: Settings2,
    name: 'Fully customisable.',
    description:
      'Adjust traffic density, weather, simulation speed and sector configuration to tailor every session — from quiet training periods to full-scale rush-hour complexity.',
  },
  {
    icon: BookOpen,
    name: 'Comprehensive documentation.',
    description:
      'A step-by-step guide to controlling along with sector-specific data and training videos help you understand the airspace and air traffic control before you start working traffic.',
  },
];

export default Features;
