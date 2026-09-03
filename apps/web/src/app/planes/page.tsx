import Link from 'next/link';
import { Button, Logo, Badge } from '@karpos/ui';
import { Check, X, Sprout, Trees, Leaf, Globe, ArrowRight, ChevronDown } from 'lucide-react';

export const metadata = {
  title: 'Planes y precios',
  description:
    'Planes de Karpos para productores, fincas corporativas y exportadoras. Precios transparentes en USD.',
};

type Tier = {
  id: 'free' | 'starter' | 'pro' | 'enterprise';
  name: string;
  tagline: string;
  Icon: React.ComponentType<{ className?: string }>;
  monthly: number | null; // null = custom
  annual: number | null;
  cta: { label: string; href: string };
  popular?: boolean;
  features: string[];
};

const TIERS: Tier[] = [
  {
    id: 'free',
    name: 'Cultivador',
    tagline: 'Para empezar a digitalizar sin pagar.',
    Icon: Sprout,
    monthly: 0,
    annual: 0,
    cta: { label: 'Empezar gratis', href: '/signup' },
    features: [
      'Hasta 5 ha',
      '1 finca, 5 lotes',
      '1 usuario',
      '3 módulos: Predios, Bitácora, Fenoflow',
      'Histórico 3 meses',
      'Catálogo ICA en sólo lectura',
      'Soporte por documentación',
    ],
  },
  {
    id: 'starter',
    name: 'Productor',
    tagline: 'Productor independiente que exporta o vende a packing.',
    Icon: Leaf,
    monthly: 59,
    annual: 590,
    cta: { label: 'Probar 14 días', href: '/signup?plan=starter' },
    features: [
      'Hasta 200 ha',
      'Hasta 3 fincas, lotes ilimitados',
      '5 usuarios',
      'Los 5 módulos completos',
      'Histórico ilimitado',
      'Catálogo ICA + productos propios',
      'Portal de trazabilidad QR público',
      'Exportación a CSV/Excel',
      'Backup nightly',
      'Soporte por chat (<24 h)',
    ],
  },
  {
    id: 'pro',
    name: 'Multifinca',
    tagline: 'Empresa frutícola con varios predios. La opción más elegida.',
    Icon: Trees,
    monthly: 249,
    annual: 2490,
    popular: true,
    cta: { label: 'Hablar con ventas', href: '/contacto?plan=pro' },
    features: [
      'Hasta 1.500 ha',
      'Hasta 10 fincas',
      '25 usuarios',
      'Los 5 módulos + Catálogos avanzados',
      'Reportes consolidados multi-finca',
      'Permisos por rol',
      'API REST (sólo lectura)',
      'Portal QR con branding básico',
      'Backup nightly + restauración asistida',
      'Onboarding asistido (1 sesión)',
      'SLA 99.5% uptime',
      'Soporte chat + email (<4 h hábil)',
    ],
  },
  {
    id: 'enterprise',
    name: 'Exportador',
    tagline: 'Exportadoras y cooperativas con productores asociados.',
    Icon: Globe,
    monthly: null,
    annual: null,
    cta: { label: 'Solicitar cotización', href: '/contacto?plan=enterprise' },
    features: [
      'Hectáreas, fincas y usuarios ilimitados',
      'Multi-organización federada',
      'White-label (logo, colores, dominio propio)',
      'SSO / SAML (Keycloak, Azure AD, Auth0)',
      'API REST completa (read+write) + webhooks',
      'Audit logs descargables',
      'Backup off-site + recuperación punto en el tiempo',
      'SLA 99.9% con créditos',
      'Gerente de cuenta dedicado',
      'Soporte 24×7',
      'Migración Excel/Access incluida',
      'Capacitación de equipo incluida',
    ],
  },
];

const COMPARISON_ROWS: { label: string; values: [string, string, string, string]; section?: string }[] = [
  { section: 'Capacidad' } as never,
  { label: 'Hectáreas', values: ['5', '200', '1.500', 'ilimitadas'] },
  { label: 'Fincas', values: ['1', '3', '10', 'ilimitadas'] },
  { label: 'Lotes', values: ['5', 'ilimitados', 'ilimitados', 'ilimitados'] },
  { label: 'Usuarios', values: ['1', '5', '25', 'ilimitados'] },
  { label: 'Histórico', values: ['3 meses', 'ilimitado', 'ilimitado', 'ilimitado'] },
  { section: 'Módulos' } as never,
  { label: 'Predios + Lotes', values: ['✓', '✓', '✓', '✓'] },
  { label: 'Bitácora Verde', values: ['✓', '✓', '✓', '✓'] },
  { label: 'Fenoflow (BBCH)', values: ['✓', '✓', '✓', '✓'] },
  { label: 'Sanidad+ (PHI/REI)', values: ['—', '✓', '✓', '✓'] },
  { label: 'Cosecha360', values: ['—', '✓', '✓', '✓'] },
  { label: 'Catálogo fitosanitario propio', values: ['lectura', '✓', '✓', '✓'] },
  { section: 'Cumplimiento y trazabilidad' } as never,
  { label: 'GLOBALG.A.P. IFA v6 (append-only)', values: ['—', '✓', '✓', '✓'] },
  { label: 'Portal de trazabilidad QR', values: ['—', '✓', 'con branding', 'white-label'] },
  { label: 'Audit logs descargables', values: ['—', '—', '—', '✓'] },
  { section: 'Integraciones y plataforma' } as never,
  { label: 'API REST', values: ['—', '—', 'sólo lectura', 'completa'] },
  { label: 'Webhooks (ERP/packing)', values: ['—', '—', '—', '✓'] },
  { label: 'SSO / SAML', values: ['—', '—', '—', '✓'] },
  { label: 'Multi-organización federada', values: ['—', '—', '—', '✓'] },
  { section: 'Soporte y SLA' } as never,
  { label: 'Soporte', values: ['Docs', 'Chat <24 h', 'Chat+Email <4 h', '24×7 dedicado'] },
  { label: 'SLA uptime', values: ['—', '—', '99.5%', '99.9% con créditos'] },
  { label: 'Onboarding asistido', values: ['—', '—', '1 sesión', 'incluido completo'] },
];

const FAQS = [
  {
    q: '¿Por qué los precios están en USD?',
    a: 'Es nuestra moneda de referencia para mantener estabilidad entre países. El cobro mensual se hace en moneda local al tipo de cambio del día (Wompi para Colombia con PSE/Nequi/Daviplata, Stripe para tarjeta internacional).',
  },
  {
    q: '¿Hay periodo de prueba?',
    a: 'Cultivador es gratis para siempre con sus límites. Productor tiene 14 días gratis con todas las funciones, sin tarjeta. Pro y Exportador se contratan tras una llamada de descubrimiento.',
  },
  {
    q: '¿Puedo cambiar de plan en cualquier momento?',
    a: 'Sí. Upgrade inmediato con prorrateo del mes en curso. Downgrade efectivo al cierre del ciclo de facturación. Sin penalidades ni contratos forzosos.',
  },
  {
    q: '¿Qué pasa con mis datos si decido irme?',
    a: 'Te exportamos un dump completo de tu organización en formato Postgres SQL estándar (no propietario) cuando lo pidas. Sin lock-in. Tus datos son tuyos.',
  },
  {
    q: '¿Hay descuento por pago anual?',
    a: 'Sí. Pagando anual ahorrás el equivalente a 2 meses (~17% off) en Productor y Multifinca. Exportador puede negociar 25% off por compromiso bienal.',
  },
  {
    q: '¿Cubre la auditoría GLOBALG.A.P.?',
    a: 'Karpos te deja listo para los criterios CB 7.6 (registros append-only de aplicaciones fitosanitarias) y otros aspectos de trazabilidad. La auditoría la hace la certificadora; Karpos te entrega los datos en un click.',
  },
  {
    q: '¿Y si crecemos más de las hectáreas del plan?',
    a: 'Podés agregar hectáreas extra a Productor o Multifinca por USD 0.50/ha/mes, o pasar al plan siguiente.',
  },
  {
    q: '¿Funciona offline?',
    a: 'La web requiere conexión. La app móvil con sync offline está en roadmap para Q3 2026 y se incluye sin costo extra en Productor y superiores.',
  },
];

export default function PlanesPage() {
  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link href="/#features" className="text-neutral-600 hover:text-neutral-900">
              Producto
            </Link>
            <Link href="/planes" className="font-medium text-neutral-900">
              Planes
            </Link>
            <Link href="/portal/trazabilidad" className="text-neutral-600 hover:text-neutral-900">
              Trazabilidad
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Ingresar
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Empezar gratis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero planes */}
      <section className="border-b border-neutral-200 bg-gradient-to-b from-white to-neutral-50">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 ring-1 ring-inset ring-brand-200">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> Precios transparentes en USD
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            Planes simples,{' '}
            <span className="text-brand-600">crecé sin sobresaltos.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-neutral-600">
            Empezás gratis y subís de plan cuando crece tu operación. Sin contratos forzosos, sin lock-in.
            Cambiá o cancelá cuando quieras.
          </p>
          <p className="mt-4 text-sm text-neutral-500">
            💸 Pagando anual ahorrás el equivalente a <strong className="text-neutral-900">2 meses</strong>.
          </p>
        </div>
      </section>

      {/* Cards de planes */}
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-6 lg:grid-cols-4">
            {TIERS.map((t) => (
              <TierCard key={t.id} tier={t} />
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-neutral-500">
            Todos los precios en USD. El cobro mensual se hace en tu moneda local al tipo de cambio del día (Stripe / Wompi).
          </p>
        </div>
      </section>

      {/* Tabla comparativa completa */}
      <section className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-center text-2xl font-semibold tracking-tight md:text-3xl">
            Comparación detallada
          </h2>
          <p className="mt-3 text-center text-neutral-600">
            Todo lo que incluye cada plan, sin asteriscos.
          </p>

          <div className="mt-10 overflow-x-auto rounded-lg border border-neutral-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-left">
                  <th className="px-4 py-3 font-medium text-neutral-700"></th>
                  {TIERS.map((t) => (
                    <th key={t.id} className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide">
                      {t.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => {
                  if ('section' in row && row.section) {
                    return (
                      <tr key={`s-${i}`} className="bg-neutral-100">
                        <td colSpan={5} className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-600">
                          {row.section}
                        </td>
                      </tr>
                    );
                  }
                  return (
                    <tr key={`r-${i}`} className="border-b border-neutral-100 last:border-0">
                      <td className="px-4 py-3 text-neutral-700">{row.label}</td>
                      {row.values.map((v, j) => (
                        <td key={j} className="px-4 py-3 text-center">
                          {v === '✓' ? (
                            <Check className="mx-auto h-4 w-4 text-brand-600" />
                          ) : v === '—' ? (
                            <span className="text-neutral-300">—</span>
                          ) : (
                            <span className="text-neutral-700">{v}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-center text-2xl font-semibold tracking-tight md:text-3xl">
            Servicios complementarios
          </h2>
          <p className="mt-3 text-center text-neutral-600">
            Para hacer tu implementación más rápida y profesional.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { name: 'Migración Excel/Access', price: 'desde USD 300', desc: 'Cargamos tu histórico de planillas a Karpos.' },
              { name: 'Onboarding consultivo (4 hs)', price: 'USD 400', desc: 'Configuración inicial + capacitación.' },
              { name: 'Capacitación de equipo (8 hs)', price: 'USD 800', desc: 'Para Pro con varios usuarios.' },
              { name: 'Setup auditoría GLOBALG.A.P.', price: 'USD 1.500', desc: 'Mapeo de tus procesos a IFA v6.' },
              { name: 'Hectáreas adicionales', price: 'USD 0.50/ha/mes', desc: 'Cuando excedés el límite de tu plan.' },
              { name: 'Soporte prioritario (<1 h)', price: 'USD 200/mes', desc: 'Disponible para Pro.' },
            ].map((a) => (
              <div key={a.name} className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-neutral-900">{a.name}</h3>
                  <span className="shrink-0 rounded-md bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 ring-1 ring-inset ring-brand-200">
                    {a.price}
                  </span>
                </div>
                <p className="mt-2 text-sm text-neutral-600">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI */}
      <section className="border-b border-neutral-200 bg-neutral-950 text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-400 ring-1 ring-inset ring-brand-500/30">
            ROI directo
          </span>
          <h2 className="mt-6 text-3xl font-semibold tracking-tight md:text-4xl">
            Un solo lote rechazado en aduana cuesta entre{' '}
            <span className="text-brand-400">USD 20.000 y 60.000.</span>
          </h2>
          <p className="mt-5 text-lg text-neutral-300">
            Karpos Multifinca cuesta USD 2.490 al año. La matemática se hace sola.
          </p>
          <Link href="/signup" className="mt-8 inline-block">
            <Button size="xl" variant="primary">
              Empezar a registrar hoy <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="text-center text-2xl font-semibold tracking-tight md:text-3xl">
            Preguntas frecuentes
          </h2>
          <div className="mt-10 divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
            {FAQS.map((f, i) => (
              <details key={i} className="group px-5 py-4">
                <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-medium text-neutral-900">
                  {f.q}
                  <ChevronDown className="h-4 w-4 text-neutral-400 transition group-open:rotate-180" />
                </summary>
                <p className="mt-2 text-sm text-neutral-600">{f.a}</p>
              </details>
            ))}
          </div>
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

function TierCard({ tier }: { tier: Tier }) {
  const isPopular = tier.popular;
  return (
    <div
      className={[
        'flex flex-col rounded-xl border p-6 shadow-sm transition',
        isPopular
          ? 'border-brand-500 bg-white ring-2 ring-brand-500/30'
          : 'border-neutral-200 bg-white',
      ].join(' ')}
    >
      <div className="flex items-center gap-2">
        <div
          className={[
            'flex h-9 w-9 items-center justify-center rounded-lg',
            isPopular ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-700',
          ].join(' ')}
        >
          <tier.Icon className="h-5 w-5" />
        </div>
        <h3 className="text-base font-semibold text-neutral-900">{tier.name}</h3>
        {isPopular ? <Badge tone="brand">Recomendado</Badge> : null}
      </div>
      <p className="mt-2 text-sm text-neutral-600">{tier.tagline}</p>

      <div className="mt-6">
        {tier.monthly === null ? (
          <>
            <p className="text-3xl font-semibold tracking-tight text-neutral-900">Cotización</p>
            <p className="mt-1 text-sm text-neutral-500">A medida según tu operación.</p>
          </>
        ) : tier.monthly === 0 ? (
          <>
            <p className="text-3xl font-semibold tracking-tight text-neutral-900">Gratis</p>
            <p className="mt-1 text-sm text-neutral-500">Para siempre, con límites.</p>
          </>
        ) : (
          <>
            <p className="text-3xl font-semibold tracking-tight text-neutral-900">
              <span className="text-base font-normal text-neutral-400">USD </span>
              {tier.monthly}
              <span className="text-base font-normal text-neutral-500">/mes</span>
            </p>
            {tier.annual ? (
              <p className="mt-1 text-xs text-neutral-500">
                o <strong className="text-neutral-700">USD {tier.annual}/año</strong> · ahorrás 2 meses
              </p>
            ) : null}
          </>
        )}
      </div>

      <Link href={tier.cta.href} className="mt-6">
        <Button variant={isPopular ? 'primary' : 'secondary'} className="w-full">
          {tier.cta.label}
        </Button>
      </Link>

      <ul className="mt-6 space-y-2 text-sm">
        {tier.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
            <span className="text-neutral-700">{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
