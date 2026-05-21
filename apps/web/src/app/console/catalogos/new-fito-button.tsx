'use client';

import { useState } from 'react';
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
} from '@karpos/ui';
import { Plus } from 'lucide-react';
import { getBrowserClient } from '@/lib/api-client.client';
import type { FitoProduct } from '@karpos/sdk';

const CATEGORIES = [
  ['fungicide', 'Fungicida'],
  ['insecticide', 'Insecticida'],
  ['acaricide', 'Acaricida'],
  ['herbicide', 'Herbicida'],
  ['bactericide', 'Bactericida'],
  ['nematicide', 'Nematicida'],
  ['plant_growth_regulator', 'Regulador de crecimiento'],
  ['biological', 'Biológico'],
  ['adjuvant', 'Coadyuvante'],
  ['fertilizer', 'Fertilizante foliar'],
  ['other', 'Otro'],
] as const;

const DOSE_UNITS = ['L/ha', 'mL/ha', 'kg/ha', 'g/ha', 'mL/100L', 'g/100L', 'L/100L'] as const;
const FORMULATIONS = ['SC', 'EC', 'WP', 'WG', 'SL', 'OD', 'CS', 'DF', 'SG', 'GR', 'EW'] as const;
const TOX_CLASSES = ['I', 'II', 'III', 'IV'] as const;

export function NewFitoButton({
  product,
  trigger,
  onClose,
  variant = 'primary',
}: {
  product?: FitoProduct;
  trigger?: React.ReactNode;
  onClose?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!product;

  const [commercialName, setCommercialName] = useState(product?.commercialName ?? '');
  const [activeIngredient, setActiveIngredient] = useState(product?.activeIngredient ?? '');
  const [registrationNo, setRegistrationNo] = useState(product?.registrationNo ?? '');
  const [formulationType, setFormulationType] = useState(product?.formulationType ?? '');
  const [category, setCategory] = useState<string>(product?.category ?? 'fungicide');
  const [toxicologyClass, setToxicologyClass] = useState<string>(product?.toxicologyClass ?? '');
  const [defaultPhiDays, setDefaultPhiDays] = useState(String(product?.defaultPhiDays ?? 14));
  const [defaultReiHours, setDefaultReiHours] = useState(
    product?.defaultReiHours != null ? String(product.defaultReiHours) : '',
  );
  const [doseMin, setDoseMin] = useState(product?.recommendedDoseMin != null ? String(product.recommendedDoseMin) : '');
  const [doseMax, setDoseMax] = useState(product?.recommendedDoseMax != null ? String(product.recommendedDoseMax) : '');
  const [doseUnit, setDoseUnit] = useState<string>(product?.doseUnit ?? 'L/ha');
  const [targetPests, setTargetPests] = useState((product?.targetPests ?? []).join(', '));
  const [targetCrops, setTargetCrops] = useState((product?.targetCrops ?? []).join(', '));
  const [modeOfAction, setModeOfAction] = useState(product?.modeOfAction ?? '');
  const [groupCode, setGroupCode] = useState(product?.groupCode ?? '');
  const [manufacturer, setManufacturer] = useState(product?.manufacturer ?? '');
  const [notes, setNotes] = useState(product?.notes ?? '');

  function close() {
    setOpen(false);
    onClose?.();
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const sdk = getBrowserClient();
      const payload = {
        commercialName,
        activeIngredient,
        registrationNo: registrationNo || undefined,
        formulationType: formulationType || undefined,
        category,
        toxicologyClass: toxicologyClass || undefined,
        defaultPhiDays: Number(defaultPhiDays),
        defaultReiHours: defaultReiHours ? Number(defaultReiHours) : undefined,
        recommendedDoseMin: doseMin ? Number(doseMin) : undefined,
        recommendedDoseMax: doseMax ? Number(doseMax) : undefined,
        doseUnit: doseUnit || undefined,
        targetPests: targetPests.split(',').map((s) => s.trim()).filter(Boolean),
        targetCrops: targetCrops.split(',').map((s) => s.trim()).filter(Boolean),
        modeOfAction: modeOfAction || undefined,
        groupCode: groupCode || undefined,
        manufacturer: manufacturer || undefined,
        notes: notes || undefined,
      };
      if (isEdit) {
        await sdk.updateFitoProduct(product!.id, payload as never);
      } else {
        await sdk.createFitoProduct(payload as never);
      }
      close();
      router.refresh();
    } catch (e: unknown) {
      setError(
        (e as { payload?: { message?: string } })?.payload?.message ??
          (e as Error).message ??
          'No se pudo guardar',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {trigger ? (
        <button type="button" onClick={() => setOpen(true)} className="inline-flex">
          {trigger}
        </button>
      ) : (
        <Button variant={variant} onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> {isEdit ? 'Editar' : 'Nuevo producto'}
        </Button>
      )}
      <Drawer
        size="lg"
        open={open}
        onClose={() => !busy && close()}
        title={isEdit ? `Editar ${product?.commercialName}` : 'Nuevo producto fitosanitario'}
        description="Los productos que cargues acá quedan disponibles sólo para tu organización."
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={close} disabled={busy}>
              Cancelar
            </Button>
            <Button form="fito-form" type="submit" disabled={busy}>
              {busy ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          </div>
        }
      >
        <form id="fito-form" className="space-y-5" onSubmit={onSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="commercial">Nombre comercial *</Label>
              <Input id="commercial" required maxLength={120} value={commercialName} onChange={(e) => setCommercialName(e.target.value)} placeholder="Ej.: Score 250 EC" />
            </div>
            <div className="col-span-2">
              <Label htmlFor="ai">Ingrediente activo *</Label>
              <Input id="ai" required maxLength={180} value={activeIngredient} onChange={(e) => setActiveIngredient(e.target.value)} placeholder="Ej.: Difenoconazol" />
            </div>
            <div>
              <Label htmlFor="category">Categoría *</Label>
              <Select id="category" value={category} onChange={(e) => setCategory(e.target.value)} required>
                {CATEGORIES.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="form">Formulación</Label>
              <Select id="form" value={formulationType} onChange={(e) => setFormulationType(e.target.value)}>
                <option value="">—</option>
                {FORMULATIONS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="reg">N° registro (ICA)</Label>
              <Input id="reg" value={registrationNo} onChange={(e) => setRegistrationNo(e.target.value)} placeholder="ICA-XXXX" />
            </div>
            <div>
              <Label htmlFor="tox">Clase toxicológica</Label>
              <Select id="tox" value={toxicologyClass} onChange={(e) => setToxicologyClass(e.target.value)}>
                <option value="">—</option>
                {TOX_CLASSES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-neutral-200 pt-4">
            <h3 className="col-span-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Período de carencia y reingreso
            </h3>
            <div>
              <Label htmlFor="phi">PHI (días) *</Label>
              <Input id="phi" type="number" min="0" max="365" required value={defaultPhiDays} onChange={(e) => setDefaultPhiDays(e.target.value)} />
              <FieldHint>Intervalo pre-cosecha mínimo según etiqueta.</FieldHint>
            </div>
            <div>
              <Label htmlFor="rei">REI (horas)</Label>
              <Input id="rei" type="number" min="0" max="720" value={defaultReiHours} onChange={(e) => setDefaultReiHours(e.target.value)} />
              <FieldHint>Intervalo de reingreso al lote.</FieldHint>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-neutral-200 pt-4">
            <h3 className="col-span-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Dosis recomendada
            </h3>
            <div>
              <Label htmlFor="dmin">Mínima</Label>
              <Input id="dmin" type="number" step="0.0001" min="0" value={doseMin} onChange={(e) => setDoseMin(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="dmax">Máxima</Label>
              <Input id="dmax" type="number" step="0.0001" min="0" value={doseMax} onChange={(e) => setDoseMax(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="du">Unidad</Label>
              <Select id="du" value={doseUnit} onChange={(e) => setDoseUnit(e.target.value)}>
                {DOSE_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-neutral-200 pt-4">
            <h3 className="col-span-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Objetivos y agronomía
            </h3>
            <div className="col-span-2">
              <Label htmlFor="pests">Plagas / enfermedades objetivo</Label>
              <Input id="pests" value={targetPests} onChange={(e) => setTargetPests(e.target.value)} placeholder="Antracnosis, Mosca de la fruta, Áfidos…" />
              <FieldHint>Separados por coma.</FieldHint>
            </div>
            <div className="col-span-2">
              <Label htmlFor="crops">Cultivos objetivo</Label>
              <Input id="crops" value={targetCrops} onChange={(e) => setTargetCrops(e.target.value)} placeholder="avocado, mango, citrus_orange…" />
              <FieldHint>Códigos del catálogo de especies, separados por coma.</FieldHint>
            </div>
            <div>
              <Label htmlFor="moa">Modo de acción</Label>
              <Input id="moa" value={modeOfAction} onChange={(e) => setModeOfAction(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="grp">Grupo (FRAC/IRAC/HRAC)</Label>
              <Input id="grp" value={groupCode} onChange={(e) => setGroupCode(e.target.value)} placeholder="FRAC 3" />
            </div>
            <div className="col-span-2">
              <Label htmlFor="man">Fabricante</Label>
              <Input id="man" value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} />
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
