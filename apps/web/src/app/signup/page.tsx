'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Label, Logo } from '@karpos/ui';

const COUNTRIES = ['CO', 'AR', 'CL', 'MX', 'ES', 'PE', 'EC', 'BR', 'US'];

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
          organization: {
            legalName: orgLegal,
            displayName: orgDisplay,
            slug: orgSlug,
            countryCode: country,
          },
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
    <main className="flex min-h-screen items-center justify-center bg-karpos-cream px-6 py-12">
      <div className="w-full max-w-lg rounded-xl border border-karpos-fog bg-white p-8 shadow-sm">
        <Logo className="mx-auto mb-6 h-10 w-auto" />
        <h1 className="text-center font-display text-2xl text-karpos-bark">Crear organización</h1>
        <p className="mt-2 text-center text-sm text-karpos-bark/60">
          El primer usuario queda como propietario de la organización.
        </p>
        <form className="mt-6 grid grid-cols-2 gap-4" onSubmit={onSubmit}>
          <div className="col-span-2">
            <Label htmlFor="orgLegal">Razón social</Label>
            <Input id="orgLegal" required value={orgLegal} onChange={(e) => setOrgLegal(e.target.value)} />
          </div>
          <div className="col-span-2">
            <Label htmlFor="orgDisplay">Nombre comercial</Label>
            <Input id="orgDisplay" required value={orgDisplay} onChange={(e) => setOrgDisplay(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="orgSlug">Slug</Label>
            <Input
              id="orgSlug"
              required
              pattern="[a-z0-9-]+"
              value={orgSlug}
              onChange={(e) => setOrgSlug(e.target.value.toLowerCase())}
            />
          </div>
          <div>
            <Label htmlFor="country">País</Label>
            <select
              id="country"
              className="flex h-10 w-full rounded-md border border-karpos-fog bg-white px-3 text-sm"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2 border-t border-karpos-fog pt-4">
            <Label htmlFor="displayName">Tu nombre</Label>
            <Input id="displayName" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div className="col-span-2">
            <Label htmlFor="email">Correo</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="col-span-2">
            <Label htmlFor="password">Contraseña (mín. 8 caracteres)</Label>
            <Input
              id="password"
              type="password"
              minLength={8}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error ? <p className="col-span-2 text-sm text-error">{error}</p> : null}
          <Button type="submit" className="col-span-2 w-full" disabled={loading}>
            {loading ? 'Creando…' : 'Crear organización'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-karpos-bark/60">
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" className="text-karpos-leaf underline">
            Ingresar
          </Link>
        </p>
      </div>
    </main>
  );
}
