import type { ReactNode } from 'react';
import React from 'react';

interface Props {
  meta?: ReactNode;
  children: ReactNode;
}

const GuestLayout: React.FC<Props> = (props) => {
  return (
    <div className="min-h-screen w-full">
      {props.meta}

      <main>{props.children}</main>
    </div>
  );
};

export default GuestLayout;
