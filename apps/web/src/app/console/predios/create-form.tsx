'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@karpos/ui';
import { getBrowserClient } from '@/lib/api-client.client';

export function CreateFarmForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('CO');
  const [region, setRegion] = useState('');
  const [totalAreaHa, setTotalAreaHa] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const sdk = getBrowserClient();
      await sdk.createFarm({
        code,
        name,
        countryCode,
        region: region || undefined,
        totalAreaHa: totalAreaHa ? Number(totalAreaHa) : undefined,
        timezone: 'America/Bogota',
      } as any);
      setCode('');
      setName('');
      setRegion('');
      setTotalAreaHa('');
      setOpen(false);
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? 'No se pudo crear la finca');
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>+ Nueva finca</Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nueva finca</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid grid-cols-2 gap-4" onSubmit={onSubmit}>
          <div>
            <Label htmlFor="code">Código</Label>
            <Input id="code" required value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="countryCode">País</Label>
            <Input
              id="countryCode"
              maxLength={2}
              required
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
            />
          </div>
          <div>
            <Label htmlFor="region">Región</Label>
            <Input id="region" value={region} onChange={(e) => setRegion(e.target.value)} />
          </div>
          <div className="col-span-2">
            <Label htmlFor="area">Área total (ha)</Label>
            <Input
              id="area"
              type="number"
              step="0.001"
              value={totalAreaHa}
              onChange={(e) => setTotalAreaHa(e.target.value)}
            />
          </div>
          {error ? <p className="col-span-2 text-sm text-error">{error}</p> : null}
          <div className="col-span-2 flex gap-2">
            <Button type="submit" disabled={busy}>
              {busy ? 'Guardando…' : 'Crear'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
