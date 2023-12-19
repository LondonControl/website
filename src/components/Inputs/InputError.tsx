import type { HTMLAttributes } from 'react';
import React from 'react';

import type ErrorInput from '@/interfaces/ErrorInput';

interface Props extends HTMLAttributes<HTMLParagraphElement> {
  messages?: ErrorInput[];
}

const InputError: React.FC<Props> = ({
  messages = [],
  className = '',
  ...props
}) => {
  return (
    <>
      {messages?.length > 0 && (
        <>
          {messages.map((error: ErrorInput, index) => (
            <p
              {...props}
              className={`text-sm text-red-600 ${className}`}
              key={index}
            >
              {error.detail}
            </p>
          ))}
        </>
      )}
    </>
  );
};

export default InputError;
