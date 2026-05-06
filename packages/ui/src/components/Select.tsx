import * as React from 'react';
import { cn } from '../lib/cn.js';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-md border border-karpos-fog bg-white px-3 py-2 text-sm text-karpos-bark shadow-sm',
        'focus:outline-none focus:ring-2 focus:ring-karpos-leaf focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = 'Select';
