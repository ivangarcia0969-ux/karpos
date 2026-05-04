import * as React from 'react';
import { cn } from '../lib/cn.js';

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const PageHeader = ({ title, description, actions, className, ...p }: PageHeaderProps) => (
  <div className={cn('flex flex-col gap-4 md:flex-row md:items-end md:justify-between', className)} {...p}>
    <div className="space-y-1">
      <h1 className="font-display text-3xl text-karpos-bark">{title}</h1>
      {description ? <p className="text-sm text-karpos-bark/70">{description}</p> : null}
    </div>
    {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
  </div>
);
