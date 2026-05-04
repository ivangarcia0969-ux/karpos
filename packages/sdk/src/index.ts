import type {
  Farm,
  Plot,
  FieldOperation,
  PhenologyEvent,
  GddDaily,
  PestScouting,
  SprayRecord,
  HarvestLot,
  HarvestPlan,
  CopilotAskResponse,
} from '@karpos/types';

export type KarposClientOptions = {
  baseUrl: string;
  getToken: () => string | Promise<string | null> | null;
  fetch?: typeof fetch;
};

export class KarposApiError extends Error {
  constructor(
    public status: number,
    public payload: unknown,
  ) {
    super(`KarposApiError ${status}`);
  }
}

export class KarposClient {
  constructor(private readonly opts: KarposClientOptions) {}

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const token = await this.opts.getToken();
    const fetchImpl = this.opts.fetch ?? fetch;
    const res = await fetchImpl(`${this.opts.baseUrl}${path}`, {
      method,
      headers: {
        'content-type': 'application/json',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    const payload = text ? JSON.parse(text) : null;
    if (!res.ok) throw new KarposApiError(res.status, payload);
    return payload as T;
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
  getFarm(id: string) { return this.request<Farm>('GET', `/v1/farms/${id}`); }
  createFarm(body: Partial<Farm> & { code: string; name: string; countryCode: string; timezone: string }) {
    return this.request<Farm>('POST', `/v1/farms`, body);
  }

  // Plots
  listPlots(farmId?: string) {
    const suffix = farmId ? `?farmId=${farmId}` : '';
    return this.request<Plot[]>('GET', `/v1/plots${suffix}`);
  }
  getPlot(id: string) { return this.request<Plot>('GET', `/v1/plots/${id}`); }

  // Bitácora Verde
  listFieldOperations(query?: { plotId?: string; from?: string; to?: string; page?: number; pageSize?: number }) {
    const qs = new URLSearchParams();
    if (query?.plotId) qs.set('plotId', query.plotId);
    if (query?.from) qs.set('from', query.from);
    if (query?.to) qs.set('to', query.to);
    if (query?.page) qs.set('page', String(query.page));
    if (query?.pageSize) qs.set('pageSize', String(query.pageSize));
    const suffix = qs.toString() ? `?${qs}` : '';
    return this.request<FieldOperation[]>('GET', `/v1/field-operations${suffix}`);
  }
  logFieldOperation(body: Record<string, unknown>) {
    return this.request<FieldOperation>('POST', `/v1/field-operations`, body);
  }

  // Fenoflow
  listPhenologyEvents(plotId: string) {
    return this.request<PhenologyEvent[]>('GET', `/v1/phenology/events?plotId=${plotId}`);
  }
  recordPhenologyEvent(body: Record<string, unknown>) {
    return this.request<PhenologyEvent>('POST', `/v1/phenology/events`, body);
  }
  computeGdd(query: { plotId: string; from: string; to: string; baseTempC?: number; upperTempC?: number }) {
    const qs = new URLSearchParams({
      plotId: query.plotId,
      from: query.from,
      to: query.to,
      baseTempC: String(query.baseTempC ?? 10),
      ...(query.upperTempC !== undefined ? { upperTempC: String(query.upperTempC) } : {}),
    });
    return this.request<GddDaily[]>('GET', `/v1/phenology/gdd?${qs}`);
  }

  // Sanidad+
  listScoutings(plotId: string) {
    return this.request<PestScouting[]>('GET', `/v1/health/scoutings?plotId=${plotId}`);
  }
  recordScouting(body: Record<string, unknown>) {
    return this.request<PestScouting>('POST', `/v1/health/scoutings`, body);
  }
  recordSpray(body: Record<string, unknown>) {
    return this.request<SprayRecord>('POST', `/v1/health/sprays`, body);
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
    return this.request<HarvestPlan>('POST', `/v1/harvest/plans`, body);
  }
  recordHarvestLot(body: Record<string, unknown>) {
    return this.request<HarvestLot>('POST', `/v1/harvest/lots`, body);
  }
  recordWeighbridgeTicket(body: Record<string, unknown>) {
    return this.request<unknown>('POST', `/v1/harvest/tickets`, body);
  }

  // Karpos IQ
  ask(body: { sessionId?: string; question: string; context?: { farmId?: string; plotId?: string; species?: string } }) {
    return this.request<CopilotAskResponse>('POST', `/v1/copilot/ask`, body);
  }
}

export type { Farm, Plot, FieldOperation, PhenologyEvent, GddDaily, PestScouting, SprayRecord, HarvestLot, HarvestPlan, CopilotAskResponse };
