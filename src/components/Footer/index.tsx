import React from 'react';

import { AppConfig } from '@/utils/AppConfig';

interface Props {}

const Footer: React.FC<Props> = () => {
  return (
    <div className="border-t border-gray-300 py-8 text-center text-sm">
      © Copyright {new Date().getFullYear()} {AppConfig.company}.
    </div>
  );
};

export default Footer;
