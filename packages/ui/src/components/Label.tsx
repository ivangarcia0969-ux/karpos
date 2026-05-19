import * as React from 'react';
import { cn } from '../lib/cn.js';

export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn('mb-1 block text-sm font-medium text-karpos-bark', className)}
      {...props}
    />
  ),
);
Label.displayName = 'Label';
