import type { ReactNode } from 'react';
import React from 'react';

import { Toaster } from '@/components/ui/sonner';

interface Props {
  meta?: ReactNode;
  children: ReactNode;
}

const GuestLayout: React.FC<Props> = (props) => {
  return (
    <div className="min-h-screen w-full">
      {props.meta}

      <main>{props.children}</main>

      <Toaster />
    </div>
  );
};

export default GuestLayout;
