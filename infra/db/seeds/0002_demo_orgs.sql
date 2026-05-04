-- 0002_demo_orgs.sql
-- Demo data: three organizations with one farm each (uva en Mendoza, aguacate en Antioquia, manzana en Maule).

INSERT INTO karpos.organizations (id, legal_name, display_name, slug, country_code, default_locale, default_currency, default_timezone, billing_email, status) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Bodega Demo Mendoza S.A.', 'Bodega Mendoza Demo', 'demo-mendoza', 'AR', 'es-AR', 'ARS', 'America/Argentina/Mendoza', 'demo+mendoza@karpos.test', 'trial'),
  ('22222222-2222-2222-2222-222222222222', 'Aguacates del Oriente Demo S.A.S.', 'Aguacates Antioquia Demo', 'demo-antioquia', 'CO', 'es-CO', 'COP', 'America/Bogota', 'demo+antioquia@karpos.test', 'trial'),
  ('33333333-3333-3333-3333-333333333333', 'Manzaneras del Maule Demo SpA', 'Manzanas Maule Demo', 'demo-maule', 'CL', 'es-CL', 'CLP', 'America/Santiago', 'demo+maule@karpos.test', 'trial')
ON CONFLICT (id) DO NOTHING;

INSERT INTO karpos.users (id, email, full_name, default_locale, status, mfa_enrolled) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'demo+owner@karpos.test', 'Productor Demo', 'es-CO', 'active', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO karpos.memberships (org_id, user_id, role_id, status)
SELECT o.id, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', r.id, 'active'
FROM karpos.organizations o
JOIN karpos.roles r ON r.code = 'owner' AND r.org_id IS NULL
WHERE o.slug IN ('demo-mendoza','demo-antioquia','demo-maule')
ON CONFLICT (org_id, user_id) DO NOTHING;

-- Farms with realistic centroids and approximate boundaries.
INSERT INTO karpos.farms (org_id, code, name, country_code, region, locality, timezone, elevation_m, total_area_ha, centroid) VALUES
  ('11111111-1111-1111-1111-111111111111', 'F-001', 'Finca Andes Sur', 'AR', 'Mendoza', 'Luján de Cuyo', 'America/Argentina/Mendoza', 950, 60.0,
   ST_GeogFromText('SRID=4326;POINT(-68.8500 -33.0500)')),
  ('22222222-2222-2222-2222-222222222222', 'F-001', 'Finca La Esperanza', 'CO', 'Antioquia', 'El Carmen de Viboral', 'America/Bogota', 2150, 32.0,
   ST_GeogFromText('SRID=4326;POINT(-75.3300 6.0850)')),
  ('33333333-3333-3333-3333-333333333333', 'F-001', 'Huerto Las Cumbres', 'CL', 'Maule', 'Curicó', 'America/Santiago', 220, 95.0,
   ST_GeogFromText('SRID=4326;POINT(-71.2530 -34.9850)'))
ON CONFLICT (org_id, code) DO NOTHING;

-- Plots: each farm gets two plots with different varieties.
WITH
  mendoza AS (
    SELECT f.id AS farm_id, o.id AS org_id, sp.id AS species_id, v.id AS variety_id
    FROM karpos.farms f
    JOIN karpos.organizations o ON o.id = f.org_id AND o.slug = 'demo-mendoza'
    JOIN catalog.crop_species sp ON sp.code = 'grape'
    JOIN catalog.varieties v ON v.species_id = sp.id AND v.code = 'malbec'
    WHERE f.code = 'F-001'
  )
INSERT INTO karpos.plots (org_id, farm_id, code, name, species_id, variety_id, planting_date, spacing_row_m, spacing_tree_m, trees_count, area_ha, centroid)
SELECT m.org_id, m.farm_id, 'P-001', 'Cuartel Malbec Alto', m.species_id, m.variety_id, '2018-08-15', 2.5, 1.5, 9000, 18.5,
  ST_GeogFromText('SRID=4326;POINT(-68.8520 -33.0510)')
FROM mendoza m
ON CONFLICT (farm_id, code) DO NOTHING;

WITH antioquia AS (
  SELECT f.id AS farm_id, o.id AS org_id, sp.id AS species_id, v.id AS variety_id
  FROM karpos.farms f
  JOIN karpos.organizations o ON o.id = f.org_id AND o.slug = 'demo-antioquia'
  JOIN catalog.crop_species sp ON sp.code = 'avocado'
  JOIN catalog.varieties v ON v.species_id = sp.id AND v.code = 'hass'
  WHERE f.code = 'F-001'
)
INSERT INTO karpos.plots (org_id, farm_id, code, name, species_id, variety_id, planting_date, spacing_row_m, spacing_tree_m, trees_count, area_ha, centroid)
SELECT a.org_id, a.farm_id, 'P-001', 'Lote Hass Norte', a.species_id, a.variety_id, '2019-03-20', 7.0, 6.0, 760, 32.0,
  ST_GeogFromText('SRID=4326;POINT(-75.3310 6.0860)')
FROM antioquia a
ON CONFLICT (farm_id, code) DO NOTHING;

WITH maule AS (
  SELECT f.id AS farm_id, o.id AS org_id, sp.id AS species_id, v.id AS variety_id
  FROM karpos.farms f
  JOIN karpos.organizations o ON o.id = f.org_id AND o.slug = 'demo-maule'
  JOIN catalog.crop_species sp ON sp.code = 'apple'
  JOIN catalog.varieties v ON v.species_id = sp.id AND v.code = 'gala'
  WHERE f.code = 'F-001'
)
INSERT INTO karpos.plots (org_id, farm_id, code, name, species_id, variety_id, planting_date, spacing_row_m, spacing_tree_m, trees_count, area_ha, centroid)
SELECT m.org_id, m.farm_id, 'P-001', 'Cuartel Gala Sur', m.species_id, m.variety_id, '2017-08-10', 4.0, 1.5, 6500, 18.0,
  ST_GeogFromText('SRID=4326;POINT(-71.2540 -34.9860)')
FROM maule m
ON CONFLICT (farm_id, code) DO NOTHING;

-- Sample phenology event per plot (full bloom).
INSERT INTO karpos.phenology_events (org_id, plot_id, observed_at, bbch_code, observed_pct, source)
SELECT p.org_id, p.id, now() - interval '120 days', '65', 60.0, 'manual'
FROM karpos.plots p
WHERE p.code = 'P-001'
ON CONFLICT DO NOTHING;
