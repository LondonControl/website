import type { LabelHTMLAttributes, PropsWithChildren } from 'react';
import React from 'react';

const Label: React.FC<
  PropsWithChildren<LabelHTMLAttributes<HTMLLabelElement>>
> = ({ className, children, ...props }) => {
  return (
    <label
      {...props}
      className={`block text-sm font-medium text-gray-700 ${className}`}
    >
      {children}
    </label>
  );
};

export default Label;
