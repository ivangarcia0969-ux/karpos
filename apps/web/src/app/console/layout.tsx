import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Logo } from '@karpos/ui';
import { Home, Trees, ClipboardList, Sprout, Bug, Wheat, LogOut } from 'lucide-react';
import { getSession } from '../../lib/session.js';

const NAV = [
  { href: '/console', label: 'Tablero', Icon: Home },
  { href: '/console/predios', label: 'Predios', Icon: Trees },
  { href: '/console/bitacora', label: 'Bitácora Verde', Icon: ClipboardList },
  { href: '/console/fenoflow', label: 'Fenoflow', Icon: Sprout },
  { href: '/console/sanidad', label: 'Sanidad+', Icon: Bug },
  { href: '/console/cosecha', label: 'Cosecha360', Icon: Wheat },
];

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <div className="flex min-h-screen bg-karpos-cream text-karpos-bark">
      <aside className="hidden w-64 shrink-0 border-r border-karpos-fog bg-white md:flex md:flex-col">
        <div className="flex h-16 items-center px-6">
          <Link href="/console" className="block">
            <Logo className="h-8 w-auto" />
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3 text-sm">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-karpos-fog"
            >
              <n.Icon className="h-4 w-4" />
              <span>{n.label}</span>
            </Link>
          ))}
        </nav>
        <form action="/api/auth/logout" method="post" className="border-t border-karpos-fog p-3">
          <div className="flex items-center justify-between px-3 py-2 text-xs text-karpos-bark/60">
            <span className="truncate">{session.email}</span>
          </div>
          <button
            type="submit"
            className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-karpos-fog"
          >
            <LogOut className="h-4 w-4" /> Salir
          </button>
        </form>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-karpos-fog bg-white px-6">
          <h2 className="font-display text-lg">Consola</h2>
          <span className="text-sm text-karpos-bark/60">{session.displayName}</span>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
