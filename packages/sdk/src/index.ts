import type {
  Farm,
  Plot,
  FieldOperation,
  PhenologyEvent,
  PestScouting,
  SprayRecord,
  HarvestLot,
  HarvestPlan,
  FitoProduct,
} from '@karpos/types';

export type Principal = {
  userId: string;
  orgId: string;
  email: string;
  displayName: string;
  role: string;
};

export type KarposClientOptions = {
  baseUrl: string;
  getToken?: () => string | Promise<string | null | undefined> | null | undefined;
  fetch?: typeof fetch;
};

export class KarposApiError extends Error {
  constructor(public status: number, public payload: unknown) {
    super(`KarposApiError ${status}`);
  }
}

export class KarposClient {
  constructor(private readonly opts: KarposClientOptions) {}

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const token = (await this.opts.getToken?.()) ?? null;
    const fetchImpl = this.opts.fetch ?? fetch;

    const init: RequestInit = {
      method,
      headers: {
        'content-type': 'application/json',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
    };
    if (body !== undefined) init.body = JSON.stringify(body);

    const res = await fetchImpl(`${this.opts.baseUrl}${path}`, init);
    const text = await res.text();
    const payload = text ? JSON.parse(text) : null;
    if (!res.ok) throw new KarposApiError(res.status, payload);
    return payload as T;
  }

  // Auth
  register(body: {
    email: string;
    password: string;
    displayName: string;
    organization: { legalName: string; displayName: string; slug: string; countryCode: string };
  }) {
    return this.request<{ principal: Principal }>('POST', '/v1/auth/register', body);
  }
  login(email: string, password: string) {
    return this.request<{ principal: Principal }>('POST', '/v1/auth/login', { email, password });
  }
  logout() {
    return this.request<void>('POST', '/v1/auth/logout');
  }
  me() {
    return this.request<{ principal: Principal }>('GET', '/v1/auth/me');
  }

  // Catalog
  listSpecies() {
    return this.request<Array<{ id: string; code: string; scientificName: string; commonNameEs: string; commonNameEn: string; family: string | null; category: string | null }>>(
      'GET',
      '/v1/catalog/species',
    );
  }
  listVarieties(speciesId?: string) {
    const suffix = speciesId ? `?speciesId=${speciesId}` : '';
    return this.request<Array<{ id: string; speciesId: string; code: string; name: string; originCountry: string | null }>>(
      'GET',
      `/v1/catalog/varieties${suffix}`,
    );
  }
  listFitoProducts(query: { category?: string; q?: string; cropCode?: string } = {}) {
    const qs = new URLSearchParams();
    if (query.category) qs.set('category', query.category);
    if (query.q) qs.set('q', query.q);
    if (query.cropCode) qs.set('cropCode', query.cropCode);
    const suffix = qs.toString() ? `?${qs}` : '';
    return this.request<Array<FitoProduct>>('GET', `/v1/catalog/fito-products${suffix}`);
  }
  getFitoProduct(id: string) {
    return this.request<FitoProduct>('GET', `/v1/catalog/fito-products/${id}`);
  }
  createFitoProduct(body: Partial<FitoProduct> & { commercialName: string; activeIngredient: string; category: string }) {
    return this.request<FitoProduct>('POST', '/v1/catalog/fito-products', body);
  }
  updateFitoProduct(id: string, body: Partial<FitoProduct>) {
    return this.request<FitoProduct>('PUT', `/v1/catalog/fito-products/${id}`, body);
  }
  deleteFitoProduct(id: string) {
    return this.request<{ ok: boolean }>('DELETE', `/v1/catalog/fito-products/${id}`);
  }
  cloneFitoProduct(id: string) {
    return this.request<FitoProduct>('POST', `/v1/catalog/fito-products/${id}/clone`);
  }

  // Predios
  listFarms(query?: { q?: string; page?: number; pageSize?: number }) {
    const qs = new URLSearchParams();
    if (query?.q) qs.set('q', query.q);
    if (query?.page) qs.set('page', String(query.page));
    if (query?.pageSize) qs.set('pageSize', String(query.pageSize));
    const suffix = qs.toString() ? `?${qs}` : '';
    return this.request<{ rows: Farm[]; total: number; page: number; pageSize: number }>(
      'GET',
      `/v1/farms${suffix}`,
    );
  }
  getFarm(id: string) {
    return this.request<Farm>('GET', `/v1/farms/${id}`);
  }
  createFarm(body: Partial<Farm> & { code: string; name: string; countryCode: string }) {
    return this.request<Farm>('POST', '/v1/farms', body);
  }
  updateFarm(id: string, body: Partial<Farm>) {
    return this.request<Farm>('PUT', `/v1/farms/${id}`, body);
  }
  deleteFarm(id: string) {
    return this.request<{ ok: boolean }>('DELETE', `/v1/farms/${id}`);
  }

  // Plots
  listPlots(farmId?: string) {
    const suffix = farmId ? `?farmId=${farmId}` : '';
    return this.request<Plot[]>('GET', `/v1/plots${suffix}`);
  }
  getPlot(id: string) {
    return this.request<Plot>('GET', `/v1/plots/${id}`);
  }
  createPlot(body: Partial<Plot> & { farmId: string; code: string; name: string }) {
    return this.request<Plot>('POST', '/v1/plots', body);
  }
  updatePlot(id: string, body: Partial<Plot>) {
    return this.request<Plot>('PUT', `/v1/plots/${id}`, body);
  }
  deletePlot(id: string) {
    return this.request<{ ok: boolean }>('DELETE', `/v1/plots/${id}`);
  }

  // Bitácora Verde
  listFieldOperations(query?: {
    plotId?: string;
    operationType?: string;
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
  }) {
    const qs = new URLSearchParams();
    if (query?.plotId) qs.set('plotId', query.plotId);
    if (query?.operationType) qs.set('operationType', query.operationType);
    if (query?.from) qs.set('from', query.from);
    if (query?.to) qs.set('to', query.to);
    if (query?.page) qs.set('page', String(query.page));
    if (query?.pageSize) qs.set('pageSize', String(query.pageSize));
    const suffix = qs.toString() ? `?${qs}` : '';
    return this.request<FieldOperation[]>('GET', `/v1/field-operations${suffix}`);
  }
  logFieldOperation(body: Record<string, unknown>) {
    return this.request<FieldOperation>('POST', '/v1/field-operations', body);
  }

  // Fenoflow
  listPhenologyEvents(plotId: string) {
    return this.request<PhenologyEvent[]>('GET', `/v1/phenology/events?plotId=${plotId}`);
  }
  recordPhenologyEvent(body: Record<string, unknown>) {
    return this.request<PhenologyEvent>('POST', '/v1/phenology/events', body);
  }

  // Sanidad+
  listScoutings(plotId: string) {
    return this.request<PestScouting[]>('GET', `/v1/health/scoutings?plotId=${plotId}`);
  }
  recordScouting(body: Record<string, unknown>) {
    return this.request<PestScouting>('POST', '/v1/health/scoutings', body);
  }
  listSprays(plotId?: string) {
    const suffix = plotId ? `?plotId=${plotId}` : '';
    return this.request<SprayRecord[]>('GET', `/v1/health/sprays${suffix}`);
  }
  recordSpray(body: Record<string, unknown>) {
    return this.request<SprayRecord>('POST', '/v1/health/sprays', body);
  }
  voidSpray(id: string, reason: string) {
    return this.request<SprayRecord>('POST', `/v1/health/sprays/${id}/void`, { reason });
  }

  // Cosecha360
  listHarvestPlans(seasonYear?: number) {
    const suffix = seasonYear ? `?seasonYear=${seasonYear}` : '';
    return this.request<HarvestPlan[]>('GET', `/v1/harvest/plans${suffix}`);
  }
  createHarvestPlan(body: Record<string, unknown>) {
    return this.request<HarvestPlan>('POST', '/v1/harvest/plans', body);
  }
  listHarvestLots(plotId?: string) {
    const suffix = plotId ? `?plotId=${plotId}` : '';
    return this.request<HarvestLot[]>('GET', `/v1/harvest/lots${suffix}`);
  }
  recordHarvestLot(body: Record<string, unknown>) {
    return this.request<HarvestLot>('POST', '/v1/harvest/lots', body);
  }
}

export type { Farm, Plot, FieldOperation, PhenologyEvent, PestScouting, SprayRecord, HarvestLot, HarvestPlan, FitoProduct };
