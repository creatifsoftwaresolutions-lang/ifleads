import { HTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';

type Color =
  | 'default'
  | 'hot'
  | 'completed'
  | 'lost'
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'negotiation';

const colors: Record<Color, string> = {
  default: 'bg-brand-light text-ink',
  hot: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  lost: 'bg-gray-100 text-gray-600',
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-purple-100 text-purple-800',
  qualified: 'bg-green-100 text-green-800',
  negotiation: 'bg-amber-100 text-amber-800',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: Color;
}

export function Badge({ color = 'default', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-block px-2.5 py-0.5 rounded-full text-[12px] font-semibold',
        colors[color],
        className
      )}
      {...props}
    />
  );
}

export function statusColor(status: string): Color {
  switch (status) {
    case 'NEW':
      return 'new';
    case 'CONTACTED':
      return 'contacted';
    case 'QUALIFIED':
      return 'qualified';
    case 'NEGOTIATION':
      return 'negotiation';
    case 'COMPLETED':
    case 'WON':
      return 'completed';
    case 'LOST':
    case 'UNQUALIFIED':
      return 'lost';
    case 'HOT':
      return 'hot';
    default:
      return 'default';
  }
}
