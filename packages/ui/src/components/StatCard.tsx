import * as React from 'react';
import { cn } from '../lib/cn.js';

type StatCardProps = {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  trend?: { value: string; positive?: boolean };
  icon?: React.ReactNode;
  tone?: 'neutral' | 'brand' | 'warning' | 'danger';
  className?: string;
};

const toneStyles = {
  neutral: 'text-neutral-900',
  brand: 'text-brand-700',
  warning: 'text-warning-700',
  danger: 'text-danger-700',
} as const;

export const StatCard = ({ label, value, hint, trend, icon, tone = 'neutral', className }: StatCardProps) => (
  <div
    className={cn(
      'flex flex-col gap-1 rounded-lg border border-neutral-200 bg-white p-5 shadow-xs',
      className,
    )}
  >
    <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-neutral-500">
      <span>{label}</span>
      {icon ? <span className="text-neutral-400">{icon}</span> : null}
    </div>
    <div className={cn('mt-1 text-3xl font-semibold tracking-tight tabular-nums', toneStyles[tone])}>
      {value}
    </div>
    <div className="flex items-center gap-2 text-xs">
      {trend ? (
        <span
          className={cn(
            'inline-flex items-center rounded-full px-1.5 py-0.5 font-medium ring-1 ring-inset',
            trend.positive
              ? 'bg-success-50 text-success-700 ring-success-500/30'
              : 'bg-danger-50 text-danger-700 ring-danger-500/30',
          )}
        >
          {trend.positive ? '↑' : '↓'} {trend.value}
        </span>
      ) : null}
      {hint ? <span className="text-neutral-500">{hint}</span> : null}
    </div>
  </div>
);
