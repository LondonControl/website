import type { HTMLAttributes } from 'react';
import React from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  status?: string | null;
}

const AuthSessionStatus: React.FC<Props> = ({
  status,
  className,
  ...props
}) => {
  return (
    <>
      {status && (
        <div
          className={`${className} text-sm font-medium text-green-600`}
          {...props}
        >
          {status}
        </div>
      )}
    </>
  );
};

export default AuthSessionStatus;
