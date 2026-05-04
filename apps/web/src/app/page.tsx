import Link from 'next/link';
import { Button, Logo } from '@karpos/ui';
import { ArrowRight, Sprout, ShieldCheck, Database, BarChart3 } from 'lucide-react';

export default function Landing() {
  return (
    <main className="min-h-screen bg-karpos-cream text-karpos-bark">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo className="h-9 w-auto" />
        <nav className="flex items-center gap-6 text-sm">
          <Link href="#producto">Producto</Link>
          <Link href="#planes">Planes</Link>
          <Link href="/portal/trazabilidad">Trazabilidad</Link>
          <Link href="/login">
            <Button size="sm">Ingresar</Button>
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <h1 className="font-display text-5xl leading-tight md:text-6xl">
          La operación frutícola, <span className="text-karpos-leaf">en datos</span>.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-karpos-bark/80">
          Karpos une finca, cuadrilla y mercado en un mismo flujo digital. Funciona offline en
          campo, traza desde la flor hasta el contenedor y explica cada recomendación.
        </p>
        <div className="mt-10 flex gap-3">
          <Link href="/signup">
            <Button size="lg">
              Comenzar <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="#producto">
            <Button size="lg" variant="outline">
              Ver demo
            </Button>
          </Link>
        </div>
      </section>

      <section id="producto" className="border-t border-karpos-fog bg-white py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              Icon: Sprout,
              title: 'Multi-cultivo',
              text: 'Caduca, cítricos, tropicales, berries, vid, frutos secos — un mismo motor.',
            },
            {
              Icon: ShieldCheck,
              title: 'Trazabilidad',
              text: 'Lote → pallet → contenedor con QR exportable y portal público.',
            },
            {
              Icon: Database,
              title: 'Offline-first',
              text: 'La cuadrilla trabaja sin señal; reconciliación al recuperar conexión.',
            },
            {
              Icon: BarChart3,
              title: 'IA explicable',
              text: 'Karpos IQ recomienda con citas a fuentes técnicas y datos del lote.',
            },
          ].map((c) => (
            <div key={c.title}>
              <c.Icon className="h-8 w-8 text-karpos-leaf" />
              <h3 className="mt-4 font-display text-xl">{c.title}</h3>
              <p className="mt-2 text-sm text-karpos-bark/80">{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-karpos-fog py-10 text-center text-sm text-karpos-bark/60">
        © {new Date().getFullYear()} Karpos. Todos los derechos reservados.
      </footer>
    </main>
  );
}
