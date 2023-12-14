import type { InputHTMLAttributes } from 'react';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  disabled?: boolean;
  isFocused?: boolean;
}

export default forwardRef(function Input(
  { disabled = false, className = '', isFocused = false, ...props }: Props,
  ref
) {
  const localRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => localRef.current?.focus(),
  }));

  useEffect(() => {
    if (isFocused) {
      localRef.current?.focus();
    }
  }, []);

  return (
    <input
      {...props}
      disabled={disabled}
      className={`rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 ${className}`}
      ref={localRef}
    />
  );
});
