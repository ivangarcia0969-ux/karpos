import * as React from 'react';
import { cn } from '../lib/cn.js';

type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export const EmptyState = ({ icon, title, description, action, className }: EmptyStateProps) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-white px-6 py-12 text-center',
      className,
    )}
  >
    {icon ? <div className="mb-3 text-neutral-400">{icon}</div> : null}
    <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
    {description ? (
      <p className="mt-1 max-w-md text-sm text-neutral-500">{description}</p>
    ) : null}
    {action ? <div className="mt-4">{action}</div> : null}
  </div>
);
