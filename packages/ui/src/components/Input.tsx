import * as React from 'react';
import { cn } from '../lib/cn.js';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'block h-9 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 shadow-xs transition',
        'placeholder:text-neutral-400',
        'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30',
        'disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-xs transition',
        'placeholder:text-neutral-400',
        'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30',
        'disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'block h-9 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 shadow-xs transition',
        'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30',
        'disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = 'Select';
