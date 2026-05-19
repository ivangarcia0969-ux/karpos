'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Label, Logo } from '@karpos/ui';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get('next') ?? '/console';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? ''}/v1/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.message ?? 'Credenciales inválidas');
        return;
      }
      router.replace(next);
    } catch {
      setError('Error de red');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-karpos-cream px-6">
      <div className="w-full max-w-md rounded-xl border border-karpos-fog bg-white p-8 shadow-sm">
        <Logo className="mx-auto mb-6 h-10 w-auto" />
        <h1 className="text-center font-display text-2xl text-karpos-bark">Ingresar a Karpos</h1>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error ? <p className="text-sm text-error">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Ingresando…' : 'Ingresar'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-karpos-bark/60">
          ¿No tenés cuenta?{' '}
          <Link href="/signup" className="text-karpos-leaf underline">
            Crear organización
          </Link>
        </p>
      </div>
    </main>
  );
}
