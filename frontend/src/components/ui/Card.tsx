import { HTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'bg-white border border-ink-border rounded-xl p-3.5 shadow-sm',
        className
      )}
      {...props}
    />
  );
}
