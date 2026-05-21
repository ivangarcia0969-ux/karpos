import * as React from 'react';
import { cn } from '../lib/cn.js';

export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn('mb-1.5 block text-xs font-medium text-neutral-700', className)}
      {...props}
    />
  ),
);
Label.displayName = 'Label';

export const FieldError = ({ children, className }: { children?: React.ReactNode; className?: string }) =>
  children ? <p className={cn('mt-1 text-xs text-danger-600', className)}>{children}</p> : null;

export const FieldHint = ({ children, className }: { children?: React.ReactNode; className?: string }) =>
  children ? <p className={cn('mt-1 text-xs text-neutral-500', className)}>{children}</p> : null;
