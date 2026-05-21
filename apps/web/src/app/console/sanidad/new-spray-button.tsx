'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Drawer,
  Input,
  Label,
  Select,
  Textarea,
  FieldError,
  FieldHint,
  Badge,
} from '@karpos/ui';
import { Beaker, Search } from 'lucide-react';
import { getBrowserClient } from '@/lib/api-client.client';
import type { FitoProduct } from '@karpos/sdk';

type Plot = { id: string; name: string; code: string };

const DOSE_UNITS = ['L/ha', 'mL/ha', 'kg/ha', 'g/ha', 'mL/100L', 'g/100L', 'L/100L'] as const;

const CATEGORY_LABEL: Record<string, string> = {
  fungicide: 'Fungicida',
  insecticide: 'Insecticida',
  acaricide: 'Acaricida',
  herbicide: 'Herbicida',
  bactericide: 'Bactericida',
  nematicide: 'Nematicida',
  plant_growth_regulator: 'Regulador',
  biological: 'Biológico',
  adjuvant: 'Coadyuvante',
  fertilizer: 'Fertilizante',
  other: 'Otro',
};

export function NewSprayButton({
  plots,
  variant = 'primary',
}: {
  plots: Plot[];
  variant?: 'primary' | 'secondary';
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [products, setProducts] = useState<FitoProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productQuery, setProductQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [manualMode, setManualMode] = useState(false);

  const [plotId, setPlotId] = useState(plots[0]?.id ?? '');
  const [appliedAt, setAppliedAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [operator, setOperator] = useState('');
  const [target, setTarget] = useState('');
  const [productName, setProductName] = useState('');
  const [activeIngredient, setActiveIngredient] = useState('');
  const [registrationNo, setRegistrationNo] = useState('');
  const [doseAmount, setDoseAmount] = useState('');
  const [doseUnit, setDoseUnit] = useState<string>('L/ha');
  const [waterLPerHa, setWaterLPerHa] = useState('');
  const [areaHa, setAreaHa] = useState('');
  const [phiDays, setPhiDays] = useState('14');
  const [reiHours, setReiHours] = useState('');
  const [equipment, setEquipment] = useState('');
  const [windKmh, setWindKmh] = useState('');
  const [tempC, setTempC] = useState('');
  const [rhPct, setRhPct] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!open) return;
    setLoadingProducts(true);
    getBrowserClient()
      .listFitoProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoadingProducts(false));
  }, [open]);

  const filteredProducts = useMemo(() => {
    if (!productQuery.trim()) return products;
    const q = productQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.commercialName.toLowerCase().includes(q) ||
        p.activeIngredient.toLowerCase().includes(q) ||
        (p.registrationNo ?? '').toLowerCase().includes(q),
    );
  }, [products, productQuery]);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  function applyProductDefaults(p: FitoProduct) {
    setProductName(p.commercialName);
    setActiveIngredient(p.activeIngredient);
    setRegistrationNo(p.registrationNo ?? '');
    setPhiDays(String(p.defaultPhiDays));
    setReiHours(p.defaultReiHours != null ? String(p.defaultReiHours) : '');
    if (p.doseUnit) setDoseUnit(p.doseUnit);
    if (p.recommendedDoseMin) setDoseAmount(String(p.recommendedDoseMin));
    if (p.targetPests.length > 0 && !target) setTarget(p.targetPests[0]!);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const sdk = getBrowserClient();
      await sdk.recordSpray({
        plotId,
        fitoProductId: selectedProductId || undefined,
        appliedAt: new Date(appliedAt).toISOString(),
        operator,
        target: target || undefined,
        productName,
        activeIngredient,
        registrationNo: registrationNo || undefined,
        doseAmount: Number(doseAmount),
        doseUnit,
        waterLPerHa: waterLPerHa ? Number(waterLPerHa) : undefined,
        areaHa: Number(areaHa),
        phiDays: Number(phiDays),
        reiHours: reiHours ? Number(reiHours) : undefined,
        equipment: equipment || undefined,
        windKmh: windKmh ? Number(windKmh) : undefined,
        tempC: tempC ? Number(tempC) : undefined,
        rhPct: rhPct ? Number(rhPct) : undefined,
        notes: notes || undefined,
      });
      setOpen(false);
      reset();
      router.refresh();
    } catch (e: unknown) {
      setError((e as { payload?: { message?: string } })?.payload?.message ?? 'No se pudo registrar');
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setSelectedProductId('');
    setProductQuery('');
    setManualMode(false);
    setOperator('');
    setTarget('');
    setProductName('');
    setActiveIngredient('');
    setRegistrationNo('');
    setDoseAmount('');
    setWaterLPerHa('');
    setAreaHa('');
    setPhiDays('14');
    setReiHours('');
    setEquipment('');
    setWindKmh('');
    setTempC('');
    setRhPct('');
    setNotes('');
  }

  const phiEndDate = useMemo(() => {
    if (!phiDays || !appliedAt) return null;
    const end = new Date(appliedAt);
    end.setDate(end.getDate() + Number(phiDays));
    return end;
  }, [phiDays, appliedAt]);

  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)} disabled={plots.length === 0}>
        <Beaker className="h-4 w-4" /> Aplicación
      </Button>
      <Drawer
        size="lg"
        open={open}
        onClose={() => !busy && setOpen(false)}
        title="Registrar aplicación fitosanitaria"
        description="Elegí un producto del catálogo (auto-completa PHI, REI, dosis recomendada) o cargá manualmente."
        footer={
          <div className="flex items-center justify-between">
            <div className="text-xs text-neutral-500">
              {phiEndDate ? (
                <>
                  PHI hasta <strong className="text-neutral-900">{phiEndDate.toISOString().slice(0, 10)}</strong>
                </>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
                Cancelar
              </Button>
              <Button form="new-spray-form" type="submit" disabled={busy}>
                {busy ? 'Guardando…' : 'Registrar aplicación'}
              </Button>
            </div>
          </div>
        }
      >
        <form id="new-spray-form" className="space-y-5" onSubmit={onSubmit}>
          <div>
            <Label htmlFor="plot">Lote *</Label>
            <Select id="plot" value={plotId} onChange={(e) => setPlotId(e.target.value)} required>
              {plots.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code})
                </option>
              ))}
            </Select>
          </div>

          {!manualMode ? (
            <div>
              <Label>Producto del catálogo</Label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <Input
                  className="pl-9"
                  placeholder="Buscar por nombre comercial, ingrediente activo o N° ICA…"
                  value={productQuery}
                  onChange={(e) => setProductQuery(e.target.value)}
                />
              </div>
              <div className="mt-2 max-h-64 overflow-y-auto rounded-md border border-neutral-200">
                {loadingProducts ? (
                  <p className="px-3 py-4 text-center text-xs text-neutral-500">Cargando catálogo…</p>
                ) : filteredProducts.length === 0 ? (
                  <p className="px-3 py-4 text-center text-xs text-neutral-500">Sin resultados.</p>
                ) : (
                  <ul className="divide-y divide-neutral-100">
                    {filteredProducts.slice(0, 30).map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProductId(p.id);
                            applyProductDefaults(p);
                          }}
                          className={`flex w-full items-start gap-3 px-3 py-2 text-left text-sm hover:bg-neutral-50 ${
                            selectedProductId === p.id ? 'bg-brand-50' : ''
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-neutral-900">{p.commercialName}</span>
                              <Badge tone="neutral">{CATEGORY_LABEL[p.category] ?? p.category}</Badge>
                              {p.registrationNo ? <span className="text-xs text-neutral-500">{p.registrationNo}</span> : null}
                            </div>
                            <p className="text-xs text-neutral-600">{p.activeIngredient}</p>
                            <p className="mt-0.5 text-xs text-neutral-500">
                              PHI {p.defaultPhiDays}d
                              {p.defaultReiHours ? ` · REI ${p.defaultReiHours}h` : ''}
                              {p.recommendedDoseMin
                                ? ` · ${p.recommendedDoseMin}–${p.recommendedDoseMax ?? '?'} ${p.doseUnit}`
                                : ''}
                            </p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {selectedProduct ? (
                <div className="mt-2 rounded-md bg-brand-50 px-3 py-2 text-xs text-brand-700 ring-1 ring-inset ring-brand-200">
                  <strong>{selectedProduct.commercialName}</strong> · {selectedProduct.activeIngredient}
                  {selectedProduct.modeOfAction ? ` · ${selectedProduct.modeOfAction}` : ''}
                  {selectedProduct.targetPests.length > 0 ? (
                    <p className="mt-1">Objetivo recomendado: {selectedProduct.targetPests.join(', ')}</p>
                  ) : null}
                </div>
              ) : null}
              <button
                type="button"
                className="mt-2 text-xs font-medium text-brand-700 underline-offset-2 hover:underline"
                onClick={() => setManualMode(true)}
              >
                El producto no está en el catálogo · cargar manualmente
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="text-xs font-medium text-brand-700 underline-offset-2 hover:underline"
              onClick={() => {
                setManualMode(false);
                reset();
              }}
            >
              ← Volver a buscar en el catálogo
            </button>
          )}

          <div className="grid grid-cols-2 gap-4 border-t border-neutral-200 pt-4">
            <div>
              <Label htmlFor="when">Aplicado *</Label>
              <Input id="when" type="datetime-local" required value={appliedAt} onChange={(e) => setAppliedAt(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="op">Operario *</Label>
              <Input id="op" required value={operator} onChange={(e) => setOperator(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="product">Producto comercial *</Label>
              <Input id="product" required value={productName} onChange={(e) => setProductName(e.target.value)} disabled={!manualMode && !!selectedProductId} />
            </div>
            <div>
              <Label htmlFor="ai">Ingrediente activo *</Label>
              <Input id="ai" required value={activeIngredient} onChange={(e) => setActiveIngredient(e.target.value)} disabled={!manualMode && !!selectedProductId} />
            </div>
            <div>
              <Label htmlFor="reg">N° registro (ICA)</Label>
              <Input id="reg" value={registrationNo} onChange={(e) => setRegistrationNo(e.target.value)} disabled={!manualMode && !!selectedProductId} />
            </div>
            <div>
              <Label htmlFor="target">Objetivo</Label>
              <Input id="target" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="Antracnosis, Anastrepha…" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-neutral-200 pt-4">
            <div>
              <Label htmlFor="dose">Dosis *</Label>
              <Input id="dose" required type="number" step="0.0001" min="0" value={doseAmount} onChange={(e) => setDoseAmount(e.target.value)} />
              {selectedProduct?.recommendedDoseMin ? (
                <FieldHint>
                  Recomendada: {selectedProduct.recommendedDoseMin}–{selectedProduct.recommendedDoseMax ?? '?'} {selectedProduct.doseUnit}
                </FieldHint>
              ) : null}
            </div>
            <div>
              <Label htmlFor="unit">Unidad *</Label>
              <Select id="unit" value={doseUnit} onChange={(e) => setDoseUnit(e.target.value)} required>
                {DOSE_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="area">Área (ha) *</Label>
              <Input id="area" required type="number" step="0.001" min="0" value={areaHa} onChange={(e) => setAreaHa(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="water">Agua (L/ha)</Label>
              <Input id="water" type="number" step="0.1" min="0" value={waterLPerHa} onChange={(e) => setWaterLPerHa(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="phi">PHI (días) *</Label>
              <Input id="phi" required type="number" step="1" min="0" value={phiDays} onChange={(e) => setPhiDays(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="rei">REI (horas)</Label>
              <Input id="rei" type="number" step="1" min="0" value={reiHours} onChange={(e) => setReiHours(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-neutral-200 pt-4">
            <div>
              <Label htmlFor="equip">Equipo</Label>
              <Input id="equip" value={equipment} onChange={(e) => setEquipment(e.target.value)} placeholder="Pulverizadora hidroneumática" />
            </div>
            <div>
              <Label htmlFor="wind">Viento (km/h)</Label>
              <Input id="wind" type="number" step="0.1" min="0" value={windKmh} onChange={(e) => setWindKmh(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="tempc">Temperatura (°C)</Label>
              <Input id="tempc" type="number" step="0.1" value={tempC} onChange={(e) => setTempC(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="rh">HR (%)</Label>
              <Input id="rh" type="number" step="0.1" min="0" max="100" value={rhPct} onChange={(e) => setRhPct(e.target.value)} />
            </div>
            <div className="col-span-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea id="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>

          <FieldError>{error}</FieldError>
        </form>
      </Drawer>
    </>
  );
}
