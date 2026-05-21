import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn.js';

const variants = cva(
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        primary:
          'bg-neutral-900 text-white hover:bg-neutral-800 active:bg-neutral-950 shadow-xs',
        secondary:
          'bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-50 shadow-xs',
        ghost:
          'bg-transparent text-neutral-700 hover:bg-neutral-100',
        danger:
          'bg-danger-600 text-white hover:bg-danger-700 shadow-xs',
        link:
          'bg-transparent text-brand-700 hover:text-brand-800 hover:underline underline-offset-2 p-0 h-auto',
      },
      size: {
        sm: 'h-8 rounded-md px-3 text-xs',
        md: 'h-9 rounded-md px-3.5 text-sm',
        lg: 'h-10 rounded-md px-4 text-sm',
        xl: 'h-12 rounded-md px-5 text-base',
        icon: 'h-9 w-9 rounded-md',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof variants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(variants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = 'Button';
