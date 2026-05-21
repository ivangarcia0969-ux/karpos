'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Label, Logo, FieldError, FieldHint, Select } from '@karpos/ui';

const COUNTRIES = [
  ['CO', 'Colombia'],
  ['AR', 'Argentina'],
  ['CL', 'Chile'],
  ['MX', 'México'],
  ['PE', 'Perú'],
  ['EC', 'Ecuador'],
  ['BR', 'Brasil'],
  ['ES', 'España'],
  ['US', 'Estados Unidos'],
] as const;

export default function SignupPage() {
  const router = useRouter();
  const [orgLegal, setOrgLegal] = useState('');
  const [orgDisplay, setOrgDisplay] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [country, setCountry] = useState('CO');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function suggestSlug(name: string) {
    return name
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? ''}/v1/auth/register`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          displayName,
          organization: { legalName: orgLegal, displayName: orgDisplay, slug: orgSlug, countryCode: country },
        }),
        credentials: 'include',
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.message ?? 'No se pudo registrar');
        return;
      }
      router.replace('/console');
    } catch {
      setError('Error de red');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen md:grid-cols-2">
      <div className="hidden flex-col justify-between bg-neutral-950 p-12 text-white md:flex">
        <Logo className="[&_span]:text-white" />
        <div>
          <h2 className="text-3xl font-semibold leading-tight">
            Empezá hoy <br />
            <span className="text-brand-400">vendé mañana.</span>
          </h2>
          <ul className="mt-6 space-y-2 text-sm text-neutral-300">
            <li>· 5 módulos operativos incluidos</li>
            <li>· Multi-tenant aislado por DB</li>
            <li>· Trazabilidad lista para GLOBALG.A.P.</li>
            <li>· Sin tarjeta de crédito</li>
          </ul>
        </div>
        <p className="text-xs text-neutral-500">© {new Date().getFullYear()} Karpos</p>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-semibold tracking-tight">Crear organización</h1>
          <p className="mt-1 text-sm text-neutral-600">
            El primer usuario queda como propietario.{' '}
            <Link href="/login" className="text-brand-700 underline-offset-2 hover:underline">
              Ya tengo cuenta
            </Link>
          </p>

          <form className="mt-8 grid grid-cols-2 gap-4" onSubmit={onSubmit}>
            <div className="col-span-2">
              <Label htmlFor="orgLegal">Razón social</Label>
              <Input
                id="orgLegal"
                required
                value={orgLegal}
                onChange={(e) => {
                  setOrgLegal(e.target.value);
                  if (!orgSlug) setOrgSlug(suggestSlug(e.target.value));
                  if (!orgDisplay) setOrgDisplay(e.target.value);
                }}
                placeholder="Frutícola del Valle S.A.S."
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="orgDisplay">Nombre comercial</Label>
              <Input
                id="orgDisplay"
                required
                value={orgDisplay}
                onChange={(e) => setOrgDisplay(e.target.value)}
                placeholder="Frutícola del Valle"
              />
            </div>
            <div>
              <Label htmlFor="orgSlug">Identificador (slug)</Label>
              <Input
                id="orgSlug"
                required
                pattern="[a-z0-9-]+"
                value={orgSlug}
                onChange={(e) => setOrgSlug(e.target.value.toLowerCase())}
                placeholder="fruticola-valle"
              />
              <FieldHint>Sólo minúsculas, números y guiones.</FieldHint>
            </div>
            <div>
              <Label htmlFor="country">País</Label>
              <Select id="country" value={country} onChange={(e) => setCountry(e.target.value)}>
                {COUNTRIES.map(([code, name]) => (
                  <option key={code} value={code}>
                    {code} — {name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="col-span-2 mt-2 border-t border-neutral-200 pt-4">
              <Label htmlFor="displayName">Tu nombre</Label>
              <Input
                id="displayName"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="email">Correo</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="col-span-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                minLength={8}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <FieldHint>Mínimo 8 caracteres.</FieldHint>
            </div>
            <FieldError>{error}</FieldError>
            <Button type="submit" size="lg" className="col-span-2" disabled={loading}>
              {loading ? 'Creando…' : 'Crear organización'}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
