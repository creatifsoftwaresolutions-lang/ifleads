import { cn } from '@/shared/utils/cn';

interface Props {
  size?: 'sm' | 'md' | 'lg';
}

/**
 * iF LEADS brand mark.
 * Matches official logo: lowercase "if" in red rounded square,
 * followed by bold black "LEADS".
 */
export function BrandLogo({ size = 'md' }: Props) {
  const dims = {
    sm: { box: 'w-6 h-6 text-[11px]', text: 'text-[15px]', gap: 'gap-1.5' },
    md: { box: 'w-7 h-7 text-[13px]', text: 'text-[18px]', gap: 'gap-2' },
    lg: { box: 'w-10 h-10 text-lg', text: 'text-[26px]', gap: 'gap-2.5' },
  }[size];

  return (
    <div className={cn('flex items-center', dims.gap)}>
      <div
        className={cn(
          dims.box,
          'rounded-md bg-brand-primary text-white font-bold',
          'flex items-center justify-center',
          'leading-none tracking-tight shrink-0 overflow-hidden'
        )}
      >
        <span className="-mt-px">if</span>
      </div>
      <span
        className={cn(
          dims.text,
          'font-extrabold tracking-tight text-ink leading-none'
        )}
      >
        LEADS
      </span>
    </div>
  );
}
