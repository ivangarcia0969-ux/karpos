import Link from 'next/link';
import { Button, Logo } from '@karpos/ui';
import { ArrowRight, Sprout, ShieldCheck, Database, BarChart3, MapPin, QrCode } from 'lucide-react';

export default function Landing() {
  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link href="#features" className="text-neutral-600 hover:text-neutral-900">Producto</Link>
            <Link href="#planes" className="text-neutral-600 hover:text-neutral-900">Planes</Link>
            <Link href="/portal/trazabilidad" className="text-neutral-600 hover:text-neutral-900">Trazabilidad</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">Ingresar</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Comenzar gratis</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="border-b border-neutral-200 bg-gradient-to-b from-white to-neutral-50">
        <div className="mx-auto max-w-6xl px-6 py-24 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 ring-1 ring-inset ring-brand-200">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> Plataforma SaaS frutícola
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-neutral-900 md:text-5xl">
            La operación frutícola, <span className="text-brand-600">en datos verificables.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-neutral-600">
            Karpos une finca, cuadrilla y mercado en un mismo flujo digital.
            Funciona offline en campo, traza desde la flor hasta el contenedor y
            cumple con GLOBALG.A.P.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/signup">
              <Button size="xl">
                Crear mi organización <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="xl" variant="secondary">Ver capacidades</Button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-neutral-500">
            Sin tarjeta · Multi-tenant · Multi-idioma · 5 módulos operativos
          </p>
        </div>
      </section>

      <section id="features" className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-center text-3xl font-semibold tracking-tight">
            Todo el ciclo del cultivo, en una sola plataforma
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-neutral-600">
            Predios, bitácora, fenología, sanidad fitosanitaria y cosecha conectados.
            Multi-cultivo, multi-país, listo para auditoría.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              Icon={MapPin}
              title="Predios geo-referenciados"
              text="Fincas, lotes, especies y variedades con áreas y centroides. Editor cartográfico (próximamente)."
            />
            <FeatureCard
              Icon={Sprout}
              title="Fenoflow BBCH"
              text="Cronología de estados fenológicos por lote (Meier 2001). Calculá ventanas óptimas por especie."
            />
            <FeatureCard
              Icon={Bug as never}
              title="Sanidad+ con PHI/REI"
              text="Monitoreos por categoría y severidad. Aplicaciones append-only con cálculo automático del intervalo pre-cosecha."
            />
            <FeatureCard
              Icon={ShieldCheck}
              title="GLOBALG.A.P. ready"
              text="Trazabilidad inmutable, registro de aplicaciones, lotes con timeline completo y portal público QR."
            />
            <FeatureCard
              Icon={Database}
              title="Multi-tenant aislado"
              text="Postgres con filtrado por organización en cada query. Cada cliente, sus datos. Cero contaminación."
            />
            <FeatureCard
              Icon={QrCode}
              title="Portal público de trazabilidad"
              text="Cada lote genera un QR. El consumidor final ve el historial agronómico del producto."
            />
          </div>
        </div>
      </section>

      <section className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Lista para vender hoy.</h2>
          <p className="mt-3 text-neutral-600">
            Creá tu organización en 2 minutos y empezá a registrar tu operación.
          </p>
          <Link href="/signup" className="mt-6 inline-block">
            <Button size="xl">
              Comenzar <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-xs text-neutral-500">
          <span>© {new Date().getFullYear()} Karpos. Todos los derechos reservados.</span>
          <span>Hecho para LATAM · es-CO / pt-BR / en-US</span>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  Icon,
  title,
  text,
}: {
  Icon: React.ComponentType<{ className?: string | undefined }>;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-xs transition hover:shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-neutral-900">{title}</h3>
      <p className="mt-1 text-sm text-neutral-600">{text}</p>
    </div>
  );
}
