import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn.js';

const variants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      tone: {
        neutral: 'bg-karpos-fog text-karpos-bark',
        leaf: 'bg-karpos-leaf/10 text-karpos-leaf',
        amber: 'bg-karpos-amber/15 text-karpos-bark',
        clay: 'bg-karpos-clay/15 text-karpos-clay',
        danger: 'bg-danger/15 text-danger',
        success: 'bg-success/15 text-success',
        info: 'bg-info/15 text-info',
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
