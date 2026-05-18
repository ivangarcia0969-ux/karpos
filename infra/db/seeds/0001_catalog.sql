-- 0001_catalog.sql
-- Reference data (idempotent).

INSERT INTO catalog.crop_species (code, scientific_name, common_name_es, common_name_en, family, category) VALUES
  ('apple',         'Malus domestica',      'manzana',     'apple',      'Rosaceae',     'deciduous'),
  ('pear',          'Pyrus communis',       'pera',        'pear',       'Rosaceae',     'deciduous'),
  ('grape',         'Vitis vinifera',       'uva',         'grape',      'Vitaceae',     'vine'),
  ('peach',         'Prunus persica',       'durazno',     'peach',      'Rosaceae',     'deciduous'),
  ('cherry',        'Prunus avium',         'cereza',      'cherry',     'Rosaceae',     'deciduous'),
  ('avocado',       'Persea americana',     'aguacate',    'avocado',    'Lauraceae',    'tropical'),
  ('mango',         'Mangifera indica',     'mango',       'mango',      'Anacardiaceae','tropical'),
  ('citrus_orange', 'Citrus sinensis',      'naranja',     'orange',     'Rutaceae',     'citrus'),
  ('citrus_lime',   'Citrus latifolia',     'lima',        'lime',       'Rutaceae',     'citrus'),
  ('blueberry',     'Vaccinium corymbosum', 'arandano',    'blueberry',  'Ericaceae',    'berry'),
  ('strawberry',    'Fragaria x ananassa',  'fresa',       'strawberry', 'Rosaceae',     'berry'),
  ('almond',        'Prunus dulcis',        'almendro',    'almond',     'Rosaceae',     'nut'),
  ('banana',        'Musa acuminata',       'banano',      'banana',     'Musaceae',     'tropical'),
  ('passion_fruit', 'Passiflora edulis',    'maracuya',    'passion fruit','Passifloraceae','tropical'),
  ('papaya',        'Carica papaya',        'papaya',      'papaya',     'Caricaceae',   'tropical'),
  ('pineapple',     'Ananas comosus',       'piña',        'pineapple',  'Bromeliaceae', 'tropical')
ON CONFLICT (code) DO NOTHING;

WITH s AS (SELECT id FROM catalog.crop_species WHERE code = 'apple')
INSERT INTO catalog.varieties (species_id, code, name, origin_country, notes)
SELECT s.id, v.code, v.name, v.origin, v.notes FROM s, (VALUES
  ('apple_gala',         'Gala',          'NZ', NULL),
  ('apple_fuji',         'Fuji',          'JP', NULL),
  ('apple_granny',       'Granny Smith',  'AU', NULL),
  ('apple_red_delicious','Red Delicious', 'US', NULL)
) AS v(code, name, origin, notes)
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id FROM catalog.crop_species WHERE code = 'avocado')
INSERT INTO catalog.varieties (species_id, code, name, origin_country, notes)
SELECT s.id, v.code, v.name, v.origin, v.notes FROM s, (VALUES
  ('avo_hass',    'Hass',    'US', NULL),
  ('avo_fuerte',  'Fuerte',  'MX', NULL),
  ('avo_lorena',  'Lorena',  'CO', NULL)
) AS v(code, name, origin, notes)
ON CONFLICT DO NOTHING;

WITH s AS (SELECT id FROM catalog.crop_species WHERE code = 'mango')
INSERT INTO catalog.varieties (species_id, code, name, origin_country, notes)
SELECT s.id, v.code, v.name, v.origin, v.notes FROM s, (VALUES
  ('mango_tommy', 'Tommy Atkins', 'US', NULL),
  ('mango_kent',  'Kent',         'US', NULL),
  ('mango_keitt', 'Keitt',        'US', NULL)
) AS v(code, name, origin, notes)
ON CONFLICT DO NOTHING;
