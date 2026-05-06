import * as React from 'react';
import { cn } from '../lib/cn.js';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={3}
      className={cn(
        'flex w-full rounded-md border border-karpos-fog bg-white px-3 py-2 text-sm text-karpos-bark shadow-sm placeholder:text-karpos-bark/40',
        'focus:outline-none focus:ring-2 focus:ring-karpos-leaf focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50 resize-y',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';
