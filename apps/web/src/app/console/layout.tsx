import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Logo } from '@karpos/ui';
import {
  LayoutDashboard,
  Trees,
  ClipboardList,
  Sprout,
  Bug,
  Wheat,
  LogOut,
  ChevronDown,
  Library,
} from 'lucide-react';
import { getSession } from '../../lib/session.js';
import { ActiveLink } from './active-link';

const NAV = [
  { href: '/console', label: 'Tablero', Icon: LayoutDashboard, exact: true },
  { href: '/console/predios', label: 'Predios', Icon: Trees },
  { href: '/console/bitacora', label: 'Bitácora Verde', Icon: ClipboardList },
  { href: '/console/fenoflow', label: 'Fenoflow', Icon: Sprout },
  { href: '/console/sanidad', label: 'Sanidad+', Icon: Bug },
  { href: '/console/cosecha', label: 'Cosecha360', Icon: Wheat },
  { href: '/console/catalogos', label: 'Catálogos', Icon: Library },
];

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const initials = (session.displayName ?? session.email)
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('');

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-neutral-800 bg-neutral-950 text-neutral-200 md:flex">
        <div className="flex h-16 items-center gap-2 border-b border-neutral-800 px-5">
          <Logo className="text-white [&_span]:text-white" />
        </div>

        <nav className="flex-1 space-y-0.5 p-3">
          {NAV.map((n) => (
            <ActiveLink key={n.href} href={n.href} exact={n.exact ?? false}>
              <n.Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{n.label}</span>
            </ActiveLink>
          ))}
        </nav>

        <div className="border-t border-neutral-800 p-3">
          <div className="rounded-md bg-neutral-900 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
                {initials || '?'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-white">{session.displayName}</p>
                <p className="truncate text-xs text-neutral-400">{session.email}</p>
              </div>
            </div>
            <form action="/api/auth/logout" method="post" className="mt-3">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-md border border-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-200 hover:bg-neutral-800"
              >
                <LogOut className="h-3.5 w-3.5" /> Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-6">
          <div className="flex items-center gap-3 text-sm">
            <button className="flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50">
              <span className="font-semibold text-neutral-900">{session.role === 'owner' ? 'Propietario' : session.role}</span>
              <span className="text-neutral-400">·</span>
              <span className="truncate text-neutral-500">{session.email}</span>
              <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 ring-1 ring-inset ring-brand-200">
              Fase 1
            </span>
          </div>
        </header>
        <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
