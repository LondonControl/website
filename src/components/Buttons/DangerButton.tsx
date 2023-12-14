import type { ButtonHTMLAttributes } from 'react';
import React from 'react';

const DangerButton: React.FC<ButtonHTMLAttributes<HTMLButtonElement>> = ({
  type = 'submit',
  className,
  ...props
}) => {
  return (
    <button
      type={type}
      className={`inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 active:bg-red-700 ${className}`}
      {...props}
    />
  );
};

export default DangerButton;
