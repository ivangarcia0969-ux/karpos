#!/usr/bin/env node
// Karpos — Seed de datos de demo realistas para presentar a clientes.
// Idempotente: usá ON CONFLICT DO NOTHING en todas las inserciones.
//
// Crea:
//   - 1 organización demo: Frutícola del Valle S.A.S.
//   - 1 usuario propietario: demo@karpos.com / demo1234
//   - 3 fincas (Valle del Cauca, Caldas, Magdalena)
//   - 7 lotes con aguacate Hass, mango Tommy/Kent, naranja Valencia, lima Tahití
//   - ~35 operaciones de campo distribuidas en los últimos 6 meses
//   - 14 eventos BBCH cronológicos por lote
//   - 6 monitoreos de plagas/enfermedades reales
//   - 6 aplicaciones fitosanitarias (3 con PHI vigente, 3 vencido)
//   - 3 planes de cosecha + 8 lotes cosechados con calidades
//
// Uso:
//   DATABASE_URL=postgres://... node scripts/seed-demo.mjs

import postgres from 'postgres';
import bcrypt from 'bcryptjs';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const sql = postgres(url, { max: 1, prepare: false });

// UUIDs fijos para idempotencia
const ORG_ID = '11111111-1111-1111-1111-111111111111';
const USER_ID = '22222222-2222-2222-2222-222222222222';

const FARM_VALLE = '33333333-3333-3333-3333-300000000001';
const FARM_CALDAS = '33333333-3333-3333-3333-300000000002';
const FARM_MAGDALENA = '33333333-3333-3333-3333-300000000003';

const PLOT_AVO_NORTE = '44444444-4444-4444-4444-400000000001';
const PLOT_AVO_SUR = '44444444-4444-4444-4444-400000000002';
const PLOT_AVO_ALTO = '44444444-4444-4444-4444-400000000003';
const PLOT_NARANJA = '44444444-4444-4444-4444-400000000004';
const PLOT_LIMA = '44444444-4444-4444-4444-400000000005';
const PLOT_MANGO_T = '44444444-4444-4444-4444-400000000006';
const PLOT_MANGO_K = '44444444-4444-4444-4444-400000000007';

const today = new Date();
function daysAgo(n) {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d;
}
function dateOnly(d) {
  return d.toISOString().slice(0, 10);
}
function ts(d) {
  return d.toISOString();
}

async function main() {
  console.log('[1/9] Organización + usuario propietario');
  const passwordHash = await bcrypt.hash('demo1234', 10);
  await sql`
    INSERT INTO karpos.organizations (id, legal_name, display_name, slug, country_code, default_locale, default_currency, default_timezone, status)
    VALUES (${ORG_ID}, 'Frutícola del Valle S.A.S.', 'Frutícola del Valle', 'fruticola-valle', 'CO', 'es-CO', 'COP', 'America/Bogota', 'active')
    ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    INSERT INTO karpos.users (id, email, password_hash, display_name, locale, status)
    VALUES (${USER_ID}, 'demo@karpos.com', ${passwordHash}, 'Iván García (demo)', 'es-CO', 'active')
    ON CONFLICT (id) DO NOTHING
  `;
  await sql`
    INSERT INTO karpos.memberships (org_id, user_id, role)
    VALUES (${ORG_ID}, ${USER_ID}, 'owner')
    ON CONFLICT (org_id, user_id) DO NOTHING
  `;

  console.log('[2/9] Fincas');
  await sql`
    INSERT INTO karpos.farms (id, org_id, code, name, country_code, region, locality, timezone, elevation_m, total_area_ha, centroid, metadata)
    VALUES
      (${FARM_VALLE}, ${ORG_ID}, 'F-001', 'Hacienda El Mirador', 'CO', 'Valle del Cauca', 'La Unión', 'America/Bogota', 1050, 142.500,
       '{"type":"Point","coordinates":[-76.0911,4.5360]}'::jsonb,
       '{"manager":"Carlos Andrés Vásquez","phone":"+57 318 555 0142"}'::jsonb),
      (${FARM_CALDAS}, ${ORG_ID}, 'F-002', 'Finca La Esperanza', 'CO', 'Caldas', 'Chinchiná', 'America/Bogota', 1480, 86.750,
       '{"type":"Point","coordinates":[-75.6064,4.9831]}'::jsonb,
       '{"manager":"Diana Marcela Ríos","phone":"+57 310 555 0287"}'::jsonb),
      (${FARM_MAGDALENA}, ${ORG_ID}, 'F-003', 'Predio Costa Brava', 'CO', 'Magdalena', 'Ciénaga', 'America/Bogota', 25, 215.000,
       '{"type":"Point","coordinates":[-74.2456,10.9956]}'::jsonb,
       '{"manager":"Jairo Andrés Pacheco","phone":"+57 322 555 0319"}'::jsonb)
    ON CONFLICT (id) DO NOTHING
  `;

  console.log('[3/9] Lotes (con referencia al catálogo)');
  const [avocadoSp] = await sql`SELECT id FROM catalog.crop_species WHERE code = 'avocado'`;
  const [orangeSp] = await sql`SELECT id FROM catalog.crop_species WHERE code = 'citrus_orange'`;
  const [limeSp] = await sql`SELECT id FROM catalog.crop_species WHERE code = 'citrus_lime'`;
  const [mangoSp] = await sql`SELECT id FROM catalog.crop_species WHERE code = 'mango'`;

  const [hassVar] = await sql`SELECT id FROM catalog.varieties WHERE code = 'avo_hass'`;
  const [fuerteVar] = await sql`SELECT id FROM catalog.varieties WHERE code = 'avo_fuerte'`;
  const [tommyVar] = await sql`SELECT id FROM catalog.varieties WHERE code = 'mango_tommy'`;
  const [kentVar] = await sql`SELECT id FROM catalog.varieties WHERE code = 'mango_kent'`;

  await sql`
    INSERT INTO karpos.plots (id, org_id, farm_id, code, name, species_id, variety_id, planting_date, spacing_row_m, spacing_tree_m, trees_count, area_ha, status, metadata)
    VALUES
      (${PLOT_AVO_NORTE}, ${ORG_ID}, ${FARM_VALLE}, 'L-AVO-N', 'Aguacate Norte', ${avocadoSp.id}, ${hassVar.id}, '2019-03-15', 7.0, 5.0, 1280, 28.500, 'active',
       '{"notes":"Lote principal de exportación. Riego por goteo. Cosecha Q3-Q4."}'::jsonb),
      (${PLOT_AVO_SUR}, ${ORG_ID}, ${FARM_VALLE}, 'L-AVO-S', 'Aguacate Sur', ${avocadoSp.id}, ${hassVar.id}, '2020-08-10', 7.0, 5.0, 1150, 25.300, 'active',
       '{"notes":"Lote joven, primera cosecha comercial 2024."}'::jsonb),
      (${PLOT_AVO_ALTO}, ${ORG_ID}, ${FARM_CALDAS}, 'L-AVO-A', 'Hass Alto', ${avocadoSp.id}, ${hassVar.id}, '2018-04-22', 6.0, 4.5, 1820, 32.100, 'active',
       '{"notes":"Altura 1480 msnm. Materia seca >24%."}'::jsonb),
      (${PLOT_NARANJA}, ${ORG_ID}, ${FARM_VALLE}, 'L-NJ-01', 'Naranja Valencia', ${orangeSp.id}, NULL, '2017-06-01', 5.0, 4.0, 2100, 22.800, 'active',
       '{"notes":"Variedad Valencia tardía. Cosecha Q1-Q2."}'::jsonb),
      (${PLOT_LIMA}, ${ORG_ID}, ${FARM_VALLE}, 'L-LM-01', 'Lima Tahití', ${limeSp.id}, NULL, '2018-09-12', 4.5, 3.5, 1850, 18.700, 'active',
       '{"notes":"Cosecha escalonada todo el año."}'::jsonb),
      (${PLOT_MANGO_T}, ${ORG_ID}, ${FARM_MAGDALENA}, 'L-MG-T', 'Mango Tommy', ${mangoSp.id}, ${tommyVar.id}, '2016-11-20', 8.0, 6.0, 920, 48.000, 'active',
       '{"notes":"Variedad fibrosa para exportación. Costa caribe."}'::jsonb),
      (${PLOT_MANGO_K}, ${ORG_ID}, ${FARM_MAGDALENA}, 'L-MG-K', 'Mango Kent', ${mangoSp.id}, ${kentVar.id}, '2017-02-05', 8.0, 6.0, 850, 42.500, 'active',
       '{"notes":"Variedad gourmet, demanda en Europa."}'::jsonb)
    ON CONFLICT (id) DO NOTHING
  `;

  console.log('[4/9] Operaciones de campo (últimos 6 meses)');
  const ops = [
    // Aguacate Norte
    { plot: PLOT_AVO_NORTE, type: 'fertilize', d: -175, area: 28.5, notes: 'Aplicación de fondo NPK 15-15-15 + microelementos.' },
    { plot: PLOT_AVO_NORTE, type: 'prune', d: -150, area: 28.5, notes: 'Poda de formación post-cosecha. Equipo de 8 personas.' },
    { plot: PLOT_AVO_NORTE, type: 'irrigate', d: -120, area: 28.5, notes: 'Riego por goteo - reposición de déficit hídrico.' },
    { plot: PLOT_AVO_NORTE, type: 'fertilize', d: -90, area: 28.5, notes: 'Nitrato de potasio aplicado por fertirriego.' },
    { plot: PLOT_AVO_NORTE, type: 'thin', d: -60, area: 28.5, notes: 'Raleo manual para mejorar tamaño de fruto.' },
    { plot: PLOT_AVO_NORTE, type: 'soil_amendment', d: -30, area: 28.5, notes: 'Aplicación de yeso agrícola (1.5 t/ha).' },
    // Aguacate Sur
    { plot: PLOT_AVO_SUR, type: 'fertilize', d: -160, area: 25.3, notes: 'Fertilización base de temporada.' },
    { plot: PLOT_AVO_SUR, type: 'training', d: -130, area: 25.3, notes: 'Tutorado de ramas principales en árboles 3-4 años.' },
    { plot: PLOT_AVO_SUR, type: 'irrigate', d: -100, area: 25.3, notes: 'Riego para asegurar amarre de fruto.' },
    { plot: PLOT_AVO_SUR, type: 'mow', d: -45, area: 25.3, notes: 'Desbroce mecánico entre hileras.' },
    // Hass Alto
    { plot: PLOT_AVO_ALTO, type: 'prune', d: -180, area: 32.1, notes: 'Poda anual de mantenimiento.' },
    { plot: PLOT_AVO_ALTO, type: 'fertilize', d: -140, area: 32.1, notes: 'Aplicación foliar de Boro + Zinc en pre-floración.' },
    { plot: PLOT_AVO_ALTO, type: 'pest_monitoring', d: -75, area: 32.1, notes: 'Recorrido completo para detección de Phytophthora.' },
    { plot: PLOT_AVO_ALTO, type: 'irrigate', d: -50, area: 32.1, notes: 'Riego post-aplicación fitosanitaria.' },
    { plot: PLOT_AVO_ALTO, type: 'fertilize', d: -15, area: 32.1, notes: 'Fertilización foliar con quelatos de calcio.' },
    // Naranja Valencia
    { plot: PLOT_NARANJA, type: 'prune', d: -170, area: 22.8, notes: 'Poda de raleo y limpieza de chupones.' },
    { plot: PLOT_NARANJA, type: 'fertilize', d: -120, area: 22.8, notes: 'NPK + sulfato de magnesio.' },
    { plot: PLOT_NARANJA, type: 'irrigate', d: -85, area: 22.8, notes: 'Riego en período de cuajado.' },
    { plot: PLOT_NARANJA, type: 'spray', d: -55, area: 22.8, notes: 'Aplicación contra Diaphorina citri (ver Sanidad).' },
    { plot: PLOT_NARANJA, type: 'fertilize', d: -20, area: 22.8, notes: 'Fertilización pre-cosecha con énfasis en K.' },
    // Lima Tahití
    { plot: PLOT_LIMA, type: 'prune', d: -155, area: 18.7, notes: 'Poda sanitaria post-cosecha invernal.' },
    { plot: PLOT_LIMA, type: 'fertilize', d: -110, area: 18.7, notes: 'NPK estándar.' },
    { plot: PLOT_LIMA, type: 'mow', d: -80, area: 18.7, notes: 'Desbroce entre hileras.' },
    { plot: PLOT_LIMA, type: 'spray', d: -40, area: 18.7, notes: 'Aplicación preventiva contra antracnosis.' },
    // Mango Tommy
    { plot: PLOT_MANGO_T, type: 'prune', d: -190, area: 48.0, notes: 'Poda fuerte post-cosecha. Equipo motoserrista.' },
    { plot: PLOT_MANGO_T, type: 'fertilize', d: -150, area: 48.0, notes: 'Fertilización con énfasis en fósforo para floración.' },
    { plot: PLOT_MANGO_T, type: 'spray', d: -90, area: 48.0, notes: 'Inducción floral química (KNO3).' },
    { plot: PLOT_MANGO_T, type: 'irrigate', d: -65, area: 48.0, notes: 'Riego en floración crítica.' },
    { plot: PLOT_MANGO_T, type: 'spray', d: -25, area: 48.0, notes: 'Aplicación contra mosca de la fruta.' },
    // Mango Kent
    { plot: PLOT_MANGO_K, type: 'prune', d: -185, area: 42.5, notes: 'Poda de raleo + sanitaria.' },
    { plot: PLOT_MANGO_K, type: 'fertilize', d: -140, area: 42.5, notes: 'NPK 12-12-17-2 (con Mg).' },
    { plot: PLOT_MANGO_K, type: 'training', d: -100, area: 42.5, notes: 'Conducción de ramas estructurales.' },
    { plot: PLOT_MANGO_K, type: 'irrigate', d: -55, area: 42.5, notes: 'Riego de soporte en floración.' },
    { plot: PLOT_MANGO_K, type: 'spray', d: -10, area: 42.5, notes: 'Aplicación pre-cosecha contra antracnosis.' },
  ];
  for (const op of ops) {
    const start = daysAgo(-op.d);
    start.setHours(7, 0, 0, 0);
    const end = new Date(start);
    end.setHours(end.getHours() + 4);
    await sql`
      INSERT INTO karpos.field_operations (org_id, plot_id, operation_type, started_at, ended_at, area_ha, notes, inputs, recorded_by, metadata)
      VALUES (${ORG_ID}, ${op.plot}, ${op.type}, ${ts(start)}, ${ts(end)}, ${op.area}, ${op.notes}, '[]'::jsonb, ${USER_ID}, '{"source":"seed-demo"}'::jsonb)
    `;
  }

  console.log('[5/9] Eventos fenológicos BBCH (cronología por lote)');
  const phenology = [
    // Aguacate Norte (cronología ~9 meses)
    { plot: PLOT_AVO_NORTE, d: -200, code: '53', label: 'Yema floral hinchada', pct: 80 },
    { plot: PLOT_AVO_NORTE, d: -170, code: '65', label: 'Plena floración', pct: 70 },
    { plot: PLOT_AVO_NORTE, d: -140, code: '71', label: 'Cuajado de frutos', pct: 60 },
    { plot: PLOT_AVO_NORTE, d: -60, code: '79', label: 'Frutos al 90% del tamaño', pct: 85 },
    { plot: PLOT_AVO_NORTE, d: -10, code: '85', label: 'Maduración avanzada', pct: 70 },
    // Hass Alto
    { plot: PLOT_AVO_ALTO, d: -180, code: '55', label: 'Yema floral visible', pct: 50 },
    { plot: PLOT_AVO_ALTO, d: -130, code: '65', label: 'Plena floración', pct: 75 },
    { plot: PLOT_AVO_ALTO, d: -70, code: '73', label: 'Frutos a 30% del tamaño', pct: 65 },
    // Naranja Valencia
    { plot: PLOT_NARANJA, d: -160, code: '65', label: 'Plena floración', pct: 85 },
    { plot: PLOT_NARANJA, d: -90, code: '75', label: 'Fruto a mitad de tamaño', pct: 80 },
    { plot: PLOT_NARANJA, d: -20, code: '89', label: 'Madurez de cosecha', pct: 60 },
    // Mango Kent
    { plot: PLOT_MANGO_K, d: -150, code: '57', label: 'Inflorescencia visible', pct: 70 },
    { plot: PLOT_MANGO_K, d: -110, code: '69', label: 'Fin de floración', pct: 90 },
    { plot: PLOT_MANGO_K, d: -50, code: '81', label: 'Inicio de maduración', pct: 70 },
  ];
  for (const p of phenology) {
    await sql`
      INSERT INTO karpos.phenology_events (org_id, plot_id, observed_on, bbch_code, stage_label, pct_in_stage, notes, recorded_by, metadata)
      VALUES (${ORG_ID}, ${p.plot}, ${dateOnly(daysAgo(-p.d))}, ${p.code}, ${p.label}, ${p.pct}, 'Observación de cuadrilla.', ${USER_ID}, '{"source":"seed-demo"}'::jsonb)
    `;
  }

  console.log('[6/9] Monitoreos sanitarios (plagas y enfermedades reales)');
  const scoutings = [
    { plot: PLOT_AVO_NORTE, d: -78, target: 'Stenoma catenifer', category: 'pest', severity: 'low', incidence: 3.5, sample: 50, notes: 'Polilla del aguacate. Trampas con feromonas.' },
    { plot: PLOT_AVO_ALTO, d: -75, target: 'Phytophthora cinnamomi', category: 'disease', severity: 'moderate', incidence: 8.0, sample: 100, notes: 'Pudrición de raíces. Foco en zona baja con encharcamiento.' },
    { plot: PLOT_NARANJA, d: -65, target: 'Diaphorina citri', category: 'pest', severity: 'high', incidence: 22.0, sample: 80, notes: 'Vector de HLB. Acción urgente.' },
    { plot: PLOT_LIMA, d: -50, target: 'Colletotrichum gloeosporioides', category: 'disease', severity: 'moderate', incidence: 12.5, sample: 60, notes: 'Antracnosis en frutos. Condiciones de alta humedad.' },
    { plot: PLOT_MANGO_T, d: -35, target: 'Anastrepha obliqua', category: 'pest', severity: 'high', incidence: 18.0, sample: 100, notes: 'Mosca de la fruta. Captura en trampas McPhail.' },
    { plot: PLOT_MANGO_K, d: -20, target: 'Colletotrichum gloeosporioides', category: 'disease', severity: 'moderate', incidence: 15.0, sample: 80, notes: 'Antracnosis. Pre-cosecha crítico.' },
  ];
  for (const s of scoutings) {
    await sql`
      INSERT INTO karpos.pest_scoutings (org_id, plot_id, observed_on, observer_id, target, category, severity, incidence_pct, sample_size, notes, photos, metadata)
      VALUES (${ORG_ID}, ${s.plot}, ${dateOnly(daysAgo(-s.d))}, ${USER_ID}, ${s.target}, ${s.category}, ${s.severity}, ${s.incidence}, ${s.sample}, ${s.notes}, '[]'::jsonb, '{"source":"seed-demo"}'::jsonb)
    `;
  }

  console.log('[7/9] Aplicaciones fitosanitarias (3 con PHI vigente, 3 vencido)');
  const sprays = [
    // PHI vencido (aplicaciones viejas, ya libres)
    { plot: PLOT_AVO_NORTE, d: -78, op: 'Carlos A. Vásquez', prod: 'Trichoderma WP', ai: 'Trichoderma harzianum', reg: 'ICA-9854', dose: 2.0, unit: 'kg/ha', water: 800, area: 28.5, phi: 0, rei: 4, target: 'Phytophthora preventivo', notes: 'Aplicación biológica.' },
    { plot: PLOT_AVO_ALTO, d: -73, op: 'Diana M. Ríos', prod: 'Phyton 27', ai: 'Sulfato de Cobre pentahidratado', reg: 'ICA-3122', dose: 1.5, unit: 'L/ha', water: 1000, area: 32.1, phi: 14, rei: 24, target: 'Phytophthora cinnamomi', notes: 'Aplicación curativa post-monitoreo.' },
    { plot: PLOT_NARANJA, d: -60, op: 'José M. Cuesta', prod: 'Confidor 350 SC', ai: 'Imidacloprid', reg: 'ICA-4011', dose: 0.4, unit: 'L/ha', water: 900, area: 22.8, phi: 21, rei: 12, target: 'Diaphorina citri', notes: 'Control de vector HLB. Aplicación dirigida.' },
    // PHI vigente (aplicaciones recientes, no cosechar)
    { plot: PLOT_LIMA, d: -12, op: 'Pedro Sánchez', prod: 'Amistar Top 325 SC', ai: 'Azoxistrobin + Difenoconazol', reg: 'ICA-7211', dose: 0.5, unit: 'L/ha', water: 800, area: 18.7, phi: 14, rei: 24, target: 'Antracnosis preventivo', notes: 'PHI vigente hasta próxima semana.' },
    { plot: PLOT_MANGO_T, d: -8, op: 'Jairo A. Pacheco', prod: 'Lorsban 4 EC', ai: 'Clorpirifos', reg: 'ICA-1244', dose: 1.0, unit: 'L/ha', water: 1200, area: 48.0, phi: 21, rei: 48, target: 'Anastrepha obliqua', notes: 'Control de mosca de la fruta. PHI estricto.' },
    { plot: PLOT_MANGO_K, d: -5, op: 'Jairo A. Pacheco', prod: 'Score 250 EC', ai: 'Difenoconazol', reg: 'ICA-5601', dose: 0.4, unit: 'L/ha', water: 1100, area: 42.5, phi: 14, rei: 24, target: 'Colletotrichum (antracnosis)', notes: 'Aplicación pre-cosecha contra antracnosis.' },
  ];
  for (const sp of sprays) {
    const applied = daysAgo(-sp.d);
    applied.setHours(6, 30, 0, 0);
    await sql`
      INSERT INTO karpos.spray_records (org_id, plot_id, applied_at, ended_at, operator, target, product_name, active_ingredient, registration_no, dose_amount, dose_unit, water_l_per_ha, area_ha, phi_days, rei_hours, equipment, wind_kmh, temp_c, rh_pct, notes, recorded_by, metadata)
      VALUES (${ORG_ID}, ${sp.plot}, ${ts(applied)}, ${ts(new Date(applied.getTime() + 5 * 3600000))}, ${sp.op}, ${sp.target}, ${sp.prod}, ${sp.ai}, ${sp.reg}, ${sp.dose}, ${sp.unit}, ${sp.water}, ${sp.area}, ${sp.phi}, ${sp.rei}, 'Pulverizadora hidroneumática', 6.5, 22.0, 78.0, ${sp.notes}, ${USER_ID}, '{"source":"seed-demo"}'::jsonb)
    `;
  }

  console.log('[8/9] Planes de cosecha + lotes cosechados');
  const yearNow = today.getFullYear();
  await sql`
    INSERT INTO karpos.harvest_plans (org_id, plot_id, season_year, expected_start_date, expected_end_date, expected_yield_kg, expected_yield_kg_ha, forecast_method, status, notes, recorded_by, forecast_metadata)
    VALUES
      (${ORG_ID}, ${PLOT_AVO_NORTE}, ${yearNow}, ${dateOnly(daysAgo(-15))}, ${dateOnly(daysAgo(45))}, 285000, 10000, 'histórico+satélite', 'in_progress', 'Cosecha 2026, calidad alta.', ${USER_ID}, '{"basis":"5y avg"}'::jsonb),
      (${ORG_ID}, ${PLOT_NARANJA}, ${yearNow}, ${dateOnly(daysAgo(20))}, ${dateOnly(daysAgo(110))}, 615600, 27000, 'histórico', 'in_progress', 'Valencia tardía para jugo industrial.', ${USER_ID}, '{}'::jsonb),
      (${ORG_ID}, ${PLOT_MANGO_T}, ${yearNow}, ${dateOnly(daysAgo(-25))}, ${dateOnly(daysAgo(60))}, 432000, 9000, 'histórico', 'draft', 'Tommy Atkins exportación EU.', ${USER_ID}, '{}'::jsonb)
    ON CONFLICT (plot_id, season_year) DO NOTHING
  `;

  // Lotes cosechados (8 lotes)
  const todayStr = dateOnly(today);
  const lots = [
    { plot: PLOT_AVO_NORTE, code: `LOT-${yearNow}-0001`, d: -45, gross: 12500, tare: 280, qg: 'Primera', dest: 'Empacadora Cartama' },
    { plot: PLOT_AVO_NORTE, code: `LOT-${yearNow}-0002`, d: -32, gross: 14200, tare: 320, qg: 'Premium', dest: 'Exportación EU' },
    { plot: PLOT_AVO_NORTE, code: `LOT-${yearNow}-0003`, d: -18, gross: 11800, tare: 265, qg: 'Primera', dest: 'Empacadora Cartama' },
    { plot: PLOT_NARANJA, code: `LOT-${yearNow}-0004`, d: -28, gross: 22500, tare: 850, qg: 'Primera', dest: 'Jugos Hit S.A.' },
    { plot: PLOT_NARANJA, code: `LOT-${yearNow}-0005`, d: -14, gross: 19800, tare: 720, qg: 'Industria', dest: 'Jugos Hit S.A.' },
    { plot: PLOT_LIMA, code: `LOT-${yearNow}-0006`, d: -22, gross: 8400, tare: 180, qg: 'Primera', dest: 'Mercado nacional' },
    { plot: PLOT_LIMA, code: `LOT-${yearNow}-0007`, d: -3, gross: 9100, tare: 195, qg: 'Premium', dest: 'Exportación' },
    { plot: PLOT_LIMA, code: `LOT-${yearNow}-0008`, d: 0, gross: 4250, tare: 95, qg: 'Primera', dest: 'Mercado mayorista' },
  ];
  for (const l of lots) {
    const net = l.gross - l.tare;
    await sql`
      INSERT INTO karpos.harvest_lots (org_id, plot_id, lot_code, harvested_on, gross_kg, tare_kg, net_weight_kg, containers_count, quality_grade, destination, notes, recorded_by, metadata)
      VALUES (${ORG_ID}, ${l.plot}, ${l.code}, ${dateOnly(daysAgo(-l.d))}, ${l.gross}, ${l.tare}, ${net}, ${Math.round(net / 22)}, ${l.qg}, ${l.dest}, ${'Pesaje en báscula central. Calidad ' + l.qg + '.'}, ${USER_ID}, '{"source":"seed-demo"}'::jsonb)
      ON CONFLICT (org_id, lot_code) DO NOTHING
    `;
  }

  console.log('[9/9] Listo.');
  console.log('');
  console.log('Credenciales demo:');
  console.log('  email:    demo@karpos.com');
  console.log('  password: demo1234');
  console.log('');
  console.log('Resumen:');
  const [orgs] = await sql`SELECT count(*)::int AS n FROM karpos.organizations`;
  const [farms] = await sql`SELECT count(*)::int AS n FROM karpos.farms`;
  const [plots] = await sql`SELECT count(*)::int AS n FROM karpos.plots`;
  const [opsC] = await sql`SELECT count(*)::int AS n FROM karpos.field_operations`;
  const [phen] = await sql`SELECT count(*)::int AS n FROM karpos.phenology_events`;
  const [scout] = await sql`SELECT count(*)::int AS n FROM karpos.pest_scoutings`;
  const [spr] = await sql`SELECT count(*)::int AS n FROM karpos.spray_records`;
  const [hp] = await sql`SELECT count(*)::int AS n FROM karpos.harvest_plans`;
  const [hl] = await sql`SELECT count(*)::int AS n FROM karpos.harvest_lots`;
  console.log(`  Organizaciones: ${orgs.n}`);
  console.log(`  Fincas:         ${farms.n}`);
  console.log(`  Lotes:          ${plots.n}`);
  console.log(`  Operaciones:    ${opsC.n}`);
  console.log(`  Fenología:      ${phen.n}`);
  console.log(`  Monitoreos:     ${scout.n}`);
  console.log(`  Aplicaciones:   ${spr.n}`);
  console.log(`  Planes cosecha: ${hp.n}`);
  console.log(`  Lotes pesados:  ${hl.n}`);
}

main()
  .then(() => sql.end())
  .catch((e) => {
    console.error(e);
    sql.end();
    process.exit(1);
  });
