import * as React from 'react';
import { cn } from '../lib/cn.js';

type PageHeaderProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  className?: string;
};

export const PageHeader = ({ title, description, actions, breadcrumb, className }: PageHeaderProps) => (
  <div className={cn('mb-6 flex flex-col gap-3 border-b border-neutral-200 pb-5', className)}>
    {breadcrumb ? <div className="text-xs text-neutral-500">{breadcrumb}</div> : null}
    <div className="flex items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-semibold tracking-tight text-neutral-900">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-neutral-600">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  </div>
);
