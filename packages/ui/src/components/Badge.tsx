import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn.js';

const variants = cva(
  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
  {
    variants: {
      tone: {
        neutral: 'bg-neutral-100 text-neutral-700 ring-neutral-200',
        brand:   'bg-brand-50 text-brand-700 ring-brand-200',
        success: 'bg-success-50 text-success-700 ring-success-500/30',
        warning: 'bg-warning-50 text-warning-700 ring-warning-500/30',
        danger:  'bg-danger-50 text-danger-700 ring-danger-500/30',
        info:    'bg-info-50 text-info-700 ring-info-500/30',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof variants> {}

export const Badge = ({ className, tone, ...p }: BadgeProps) => (
  <span className={cn(variants({ tone }), className)} {...p} />
);
