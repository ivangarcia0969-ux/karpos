import * as React from 'react';
import { cn } from '../lib/cn.js';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState = ({ title, description, action, className, ...p }: EmptyStateProps) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-karpos-bark/20 px-6 py-16 text-center',
      className,
    )}
    {...p}
  >
    <h3 className="font-display text-xl text-karpos-bark">{title}</h3>
    {description ? <p className="max-w-md text-sm text-karpos-bark/70">{description}</p> : null}
    {action}
  </div>
);
