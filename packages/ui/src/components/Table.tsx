import * as React from 'react';
import { cn } from '../lib/cn.js';

export const TableContainer = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-xs',
      className,
    )}
    {...props}
  />
);

export const Table = ({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) => (
  <table className={cn('w-full border-collapse text-sm', className)} {...props} />
);

export const THead = ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className={cn('bg-neutral-50', className)} {...props} />
);

export const TR = ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={cn('border-b border-neutral-200 last:border-0', className)} {...props} />
);

export const TH = ({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th
    className={cn(
      'px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-neutral-500',
      className,
    )}
    {...props}
  />
);

export const TD = ({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn('px-4 py-3 text-sm text-neutral-700', className)} {...props} />
);
