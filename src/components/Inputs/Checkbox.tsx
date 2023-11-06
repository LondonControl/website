import type { InputHTMLAttributes } from 'react';
import React from 'react';

const Checkbox: React.FC<InputHTMLAttributes<HTMLInputElement>> = ({
  className = '',
  ...props
}) => {
  return (
    <input
      {...props}
      type="checkbox"
      className={`rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500 ${className}`}
    />
  );
};

export default Checkbox;
