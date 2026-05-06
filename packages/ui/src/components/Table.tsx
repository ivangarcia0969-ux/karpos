import * as React from 'react';
import { cn } from '../lib/cn.js';

export const Table = ({ className, ...p }: React.HTMLAttributes<HTMLTableElement>) => (
  <div className="w-full overflow-x-auto rounded-lg border border-karpos-fog bg-white">
    <table className={cn('w-full caption-bottom text-sm', className)} {...p} />
  </div>
);

export const TableHeader = ({ className, ...p }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className={cn('bg-karpos-fog/40', className)} {...p} />
);

export const TableBody = ({ className, ...p }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className={cn('divide-y divide-karpos-fog', className)} {...p} />
);

export const TableRow = ({ className, ...p }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={cn('hover:bg-karpos-fog/20 transition-colors', className)} {...p} />
);

export const TableHead = ({ className, ...p }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th
    className={cn('px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-karpos-bark/60', className)}
    {...p}
  />
);

export const TableCell = ({ className, ...p }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn('px-4 py-3 text-karpos-bark', className)} {...p} />
);
