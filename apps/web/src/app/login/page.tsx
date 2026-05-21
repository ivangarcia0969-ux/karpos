'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Label, Logo, FieldError } from '@karpos/ui';

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
    <main className="grid min-h-screen md:grid-cols-2">
      <div className="hidden flex-col justify-between bg-neutral-950 p-12 text-white md:flex">
        <Logo className="[&_span]:text-white" />
        <div>
          <h2 className="text-3xl font-semibold leading-tight">
            Tu operación frutícola, <span className="text-brand-400">en datos.</span>
          </h2>
          <p className="mt-4 max-w-md text-sm text-neutral-400">
            Predios, bitácora, fenología, sanidad y cosecha conectados.
            Cumple GLOBALG.A.P. desde el primer registro.
          </p>
        </div>
        <p className="text-xs text-neutral-500">© {new Date().getFullYear()} Karpos</p>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold tracking-tight">Ingresar</h1>
          <p className="mt-1 text-sm text-neutral-600">
            ¿No tenés cuenta?{' '}
            <Link href="/signup" className="text-brand-700 underline-offset-2 hover:underline">
              Crear organización
            </Link>
          </p>
          <form className="mt-8 space-y-4" onSubmit={onSubmit}>
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
            <FieldError>{error}</FieldError>
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Ingresando…' : 'Ingresar'}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
