import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { ComponentProps } from 'react';

export function Checkbox({ className, ...props }: ComponentProps<'button'> & { checked?: boolean }) {
  const { checked, ...rest } = props as any;
  return (
    <button
      type="button"
      aria-pressed={checked}
      data-state={checked ? 'checked' : 'unchecked'}
      className={cn(
        'h-4 w-4 rounded border flex items-center justify-center text-white transition-colors border-neutral-400 dark:border-neutral-600 data-[state=checked]:bg-brand-600 data-[state=checked]:border-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
        className
      )}
      {...rest}
    >
      {checked && <Check className="h-3 w-3" />}
    </button>
  );
}
