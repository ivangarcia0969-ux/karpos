import * as React from 'react';
import { cn } from '../lib/cn.js';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-10 w-full rounded-md border border-karpos-bark/20 bg-white px-3 text-sm text-karpos-bark',
        'placeholder:text-karpos-bark/40 focus:outline-none focus:ring-2 focus:ring-karpos-leaf focus:border-transparent',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
