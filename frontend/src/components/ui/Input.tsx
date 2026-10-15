import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/shared/utils/cn';

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'w-full h-9 px-3 border border-ink-border rounded-md text-sm bg-white text-ink',
      'placeholder:text-ink-muted',
      'focus:outline-none focus:border-brand-primary',
      className
    )}
    {...props}
  />
));
Input.displayName = 'Input';
