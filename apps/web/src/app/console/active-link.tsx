'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function ActiveLink({
  href,
  exact = false,
  children,
}: {
  href: string;
  exact?: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      className={[
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-neutral-800 text-white'
          : 'text-neutral-400 hover:bg-neutral-900 hover:text-white',
      ].join(' ')}
    >
      {children}
    </Link>
  );
}
