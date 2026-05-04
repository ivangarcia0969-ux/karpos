-- 0001_catalog.sql
-- Global catalog reference data: plans, schemes, species, varieties, operation types, BBCH stages.

INSERT INTO catalog.plans (code, name, tier, price_usd_month, price_usd_year, max_users, max_hectares, max_farms, modules, features, is_listed) VALUES
  ('starter', 'Starter', 'starter', 49, 490, 5,   100,  2,
   ARRAY['farms','field-log','phenology','health','harvest'],
   '{"copilot": false, "satellite": false, "support": "community"}'::jsonb, true),
  ('pro',     'Pro',     'pro',     249, 2490, 20, 1000, 10,
   ARRAY['farms','field-log','phenology','health','harvest','satellite','copilot','aquaplan','crew','traceability','exec'],
   '{"copilot": true, "satellite": true, "support": "business-hours"}'::jsonb, true),
  ('enterprise', 'Enterprise', 'enterprise', NULL, NULL, NULL, NULL, NULL,
   ARRAY['farms','field-log','phenology','health','harvest','satellite','copilot','aquaplan','crew','traceability','exec','packing','marketplace','certibox','agora'],
   '{"copilot": true, "satellite": true, "support": "24x7", "sso": true, "dedicated_cluster": true}'::jsonb, true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO catalog.certification_schemes (code, name, authority, scope, url) VALUES
  ('globalgap_ifa_v6', 'GLOBALG.A.P. IFA v6', 'GLOBALG.A.P. c/o FoodPLUS GmbH', 'Fruit and Vegetables', 'https://www.globalgap.org/'),
  ('rainforest_2020', 'Rainforest Alliance 2020', 'Rainforest Alliance', 'Sustainable Agriculture', 'https://www.rainforest-alliance.org/'),
  ('organic_eu', 'Organic EU 2018/848', 'European Commission', 'Organic production', 'https://eur-lex.europa.eu/'),
  ('smeta_4p', 'SMETA 4-Pillar', 'Sedex', 'Ethical trade audit', 'https://www.sedex.com/'),
  ('halal', 'Halal', 'Various', 'Halal certification', NULL)
ON CONFLICT (code) DO NOTHING;

INSERT INTO catalog.crop_species (code, scientific_name, common_name_es, common_name_en, family, category) VALUES
  ('apple',   'Malus domestica',     'manzana',   'apple',     'Rosaceae',  'deciduous'),
  ('pear',    'Pyrus communis',      'pera',      'pear',      'Rosaceae',  'deciduous'),
  ('grape',   'Vitis vinifera',      'uva',       'grape',     'Vitaceae',  'vine'),
  ('peach',   'Prunus persica',      'durazno',   'peach',     'Rosaceae',  'deciduous'),
  ('cherry',  'Prunus avium',        'cereza',    'cherry',    'Rosaceae',  'deciduous'),
  ('avocado', 'Persea americana',    'aguacate',  'avocado',   'Lauraceae', 'tropical'),
  ('mango',   'Mangifera indica',    'mango',     'mango',     'Anacardiaceae', 'tropical'),
  ('citrus_orange','Citrus sinensis','naranja',   'orange',    'Rutaceae',  'citrus'),
  ('citrus_lime','Citrus latifolia', 'lima',      'lime',      'Rutaceae',  'citrus'),
  ('blueberry','Vaccinium corymbosum','arandano','blueberry', 'Ericaceae','berry'),
  ('strawberry','Fragaria x ananassa','fresa',  'strawberry','Rosaceae',   'berry'),
  ('almond',  'Prunus dulcis',       'almendro',  'almond',    'Rosaceae',  'nut')
ON CONFLICT (code) DO NOTHING;

WITH s AS (SELECT id FROM catalog.crop_species WHERE code = 'apple')
INSERT INTO catalog.varieties (species_id, code, name, origin_country, pollination_group)
SELECT id, v.code, v.name, v.origin, v.pg FROM s, (VALUES
  ('gala','Gala','NZ','II'),
  ('fuji','Fuji','JP','III'),
  ('granny_smith','Granny Smith','AU','III'),
  ('pink_lady','Pink Lady','AU','III')
) AS v(code,name,origin,pg)
ON CONFLICT (species_id, code) DO NOTHING;

WITH s AS (SELECT id FROM catalog.crop_species WHERE code = 'grape')
INSERT INTO catalog.varieties (species_id, code, name, origin_country)
SELECT id, v.code, v.name, v.origin FROM s, (VALUES
  ('malbec','Malbec','FR'),
  ('cab_sauvignon','Cabernet Sauvignon','FR'),
  ('thompson','Thompson Seedless','US'),
  ('flame','Flame Seedless','US')
) AS v(code,name,origin)
ON CONFLICT (species_id, code) DO NOTHING;

WITH s AS (SELECT id FROM catalog.crop_species WHERE code = 'avocado')
INSERT INTO catalog.varieties (species_id, code, name, origin_country)
SELECT id, v.code, v.name, v.origin FROM s, (VALUES
  ('hass','Hass','US'),
  ('fuerte','Fuerte','MX'),
  ('lorena','Lorena','CO')
) AS v(code,name,origin)
ON CONFLICT (species_id, code) DO NOTHING;

INSERT INTO catalog.training_systems (code, name, applies_to, description) VALUES
  ('central_leader','Eje central',ARRAY['deciduous'],'Líder central, ramas radiales.'),
  ('spindle','Spindle',ARRAY['deciduous'],'Eje delgado con ramas cortas; alta densidad.'),
  ('vsp','VSP — Vertical shoot positioning',ARRAY['vine'],'Conducción vertical en alambres.'),
  ('pergola','Parronal / pergola',ARRAY['vine'],'Conducción horizontal sobre estructura.'),
  ('bush','Mata libre',ARRAY['tropical','deciduous'],'Sin estructura formal.'),
  ('hedge','Hedge / seto',ARRAY['citrus','tropical'],'Seto continuo formado por podas mecánicas.')
ON CONFLICT (code) DO NOTHING;

INSERT INTO catalog.operation_types (code, name_es, name_en, category, unit, applies_to) VALUES
  ('pruning_winter','Poda de invierno','Winter pruning','pruning','tree',ARRAY['deciduous','vine']),
  ('pruning_green','Poda en verde','Green pruning','pruning','tree',ARRAY['deciduous','vine','citrus']),
  ('thinning_fruit','Raleo de fruta','Fruit thinning','thinning','tree',ARRAY['deciduous']),
  ('weeding_mechanical','Control mecánico de malezas','Mechanical weeding','weeding','ha',ARRAY['deciduous','citrus','tropical','vine','berry','nut']),
  ('weeding_chemical','Control químico de malezas','Chemical weeding','weeding','ha',ARRAY['deciduous','citrus','tropical','vine','berry','nut']),
  ('fertilization','Fertilización','Fertilization','fertilization','ha',ARRAY['deciduous','citrus','tropical','vine','berry','nut']),
  ('pollination_assist','Apoyo a polinización','Pollination assistance','training','ha',ARRAY['deciduous','tropical']),
  ('canopy_training','Conducción / amarre','Canopy training','training','tree',ARRAY['vine','tropical','deciduous']),
  ('scouting','Monitoreo sanitario','Pest scouting','sanitary','ha',ARRAY['deciduous','citrus','tropical','vine','berry','nut']),
  ('spray_application','Aplicación fitosanitaria','Spray application','sanitary','ha',ARRAY['deciduous','citrus','tropical','vine','berry','nut']),
  ('harvest_picking','Cosecha — recolección','Harvest picking','harvest','kg',ARRAY['deciduous','citrus','tropical','vine','berry','nut'])
ON CONFLICT (code) DO NOTHING;

-- BBCH stages (subset, with applies_to per category).
INSERT INTO catalog.phenology_stages (bbch_code, principal_stage, secondary_stage, name_es, name_en, applies_to) VALUES
  ('00', 0, 0, 'Yemas en reposo', 'Dormant buds', ARRAY['deciduous','vine']),
  ('03', 0, 3, 'Hinchamiento de yemas', 'Bud swelling', ARRAY['deciduous','vine']),
  ('07', 0, 7, 'Apertura de yemas', 'Bud burst', ARRAY['deciduous','vine']),
  ('11', 1, 1, 'Primeras hojas', 'First leaves', ARRAY['deciduous','vine','citrus','tropical']),
  ('19', 1, 9, 'Hojas plenamente desarrolladas', 'Leaves fully expanded', ARRAY['deciduous','vine','citrus','tropical']),
  ('51', 5, 1, 'Inflorescencia visible', 'Inflorescence visible', ARRAY['deciduous','vine','citrus','tropical']),
  ('59', 5, 9, 'Botones florales separados', 'Flower buds separated', ARRAY['deciduous','vine','citrus']),
  ('61', 6, 1, 'Inicio de floración', 'Beginning of flowering', ARRAY['deciduous','vine','citrus','tropical']),
  ('65', 6, 5, 'Plena floración', 'Full flowering', ARRAY['deciduous','vine','citrus','tropical']),
  ('69', 6, 9, 'Fin de floración', 'End of flowering', ARRAY['deciduous','vine','citrus','tropical']),
  ('71', 7, 1, 'Cuajado', 'Fruit set', ARRAY['deciduous','vine','citrus','tropical']),
  ('75', 7, 5, 'Fruto a tamaño medio', 'Fruit half size', ARRAY['deciduous','vine','citrus','tropical']),
  ('81', 8, 1, 'Inicio de maduración', 'Beginning of ripening', ARRAY['deciduous','vine','citrus','tropical']),
  ('85', 8, 5, 'Coloración avanzada', 'Advanced coloring', ARRAY['deciduous','vine','citrus','tropical']),
  ('89', 8, 9, 'Madurez de cosecha', 'Harvest maturity', ARRAY['deciduous','vine','citrus','tropical']),
  ('91', 9, 1, 'Fin de cosecha', 'End of harvest', ARRAY['deciduous','vine','citrus','tropical']),
  ('95', 9, 5, 'Caída de hoja', 'Leaf fall', ARRAY['deciduous','vine'])
ON CONFLICT (bbch_code, applies_to) DO NOTHING;

INSERT INTO catalog.pest_taxa (scientific_name, common_name_es, common_name_en, group_code, hosts) VALUES
  ('Venturia inaequalis', 'Sarna del manzano', 'Apple scab', 'disease', ARRAY['apple','pear']),
  ('Erwinia amylovora', 'Fuego bacteriano', 'Fire blight', 'disease', ARRAY['apple','pear']),
  ('Cydia pomonella', 'Polilla de la manzana', 'Codling moth', 'insect', ARRAY['apple','pear']),
  ('Botrytis cinerea', 'Botritis', 'Gray mold', 'disease', ARRAY['grape','strawberry','blueberry']),
  ('Plasmopara viticola', 'Mildiu de la vid', 'Downy mildew', 'disease', ARRAY['grape']),
  ('Erysiphe necator', 'Oidio de la vid', 'Powdery mildew', 'disease', ARRAY['grape']),
  ('Phytophthora cinnamomi', 'Pudrición de raíz', 'Root rot', 'disease', ARRAY['avocado']),
  ('Heilipus lauri', 'Picudo del aguacate', 'Avocado seed weevil', 'insect', ARRAY['avocado']),
  ('Tetranychus urticae', 'Arañita roja', 'Two-spotted spider mite', 'mite', ARRAY['apple','grape','strawberry']),
  ('Diaphorina citri', 'Psilido asiatico de los citricos', 'Asian citrus psyllid', 'insect', ARRAY['citrus_orange','citrus_lime'])
ON CONFLICT (scientific_name) DO NOTHING;

INSERT INTO catalog.active_ingredients (cas_number, name, who_class, frac_code, irac_code) VALUES
  ('21087-64-9','Metribuzin','II',NULL,NULL),
  ('70630-17-0','Metalaxyl-M','III','4',NULL),
  ('143390-89-0','Kresoxim-methyl','U','11',NULL),
  ('131860-33-8','Azoxystrobin','U','11',NULL),
  ('5234-68-4','Carboxin','III','7',NULL),
  ('86-50-0','Azinphos-methyl','Ib',NULL,'1B'),
  ('142459-58-3','Flufenacet','III',NULL,NULL),
  ('110488-70-5','Dimethomorph','U','40',NULL)
ON CONFLICT (cas_number) DO NOTHING;

-- Builtin system roles (org_id null).
INSERT INTO karpos.roles (org_id, code, name, description, permissions, is_builtin) VALUES
  (NULL, 'owner', 'Propietario', 'Acceso total', ARRAY['*'], true),
  (NULL, 'admin', 'Administrador', 'Configura organización y usuarios',
    ARRAY['farms:read','farms:write','field-log:read','field-log:write','phenology:read','phenology:write',
          'health:read','health:write','sprays:apply','harvest:read','harvest:plan','harvest:write',
          'copilot:use','billing:admin','settings:write'], true),
  (NULL, 'agronomist', 'Agrónomo', 'Lectura y registros agronómicos',
    ARRAY['farms:read','field-log:read','field-log:write','phenology:read','phenology:write',
          'health:read','health:write','sprays:apply','harvest:read','harvest:plan','copilot:use'], true),
  (NULL, 'foreman', 'Mayordomo', 'Operación de campo',
    ARRAY['farms:read','field-log:read','field-log:write','phenology:read','phenology:write',
          'health:read','health:write','harvest:read','harvest:write','copilot:use'], true),
  (NULL, 'crew_lead', 'Capataz', 'Cuadrillas y rendimientos',
    ARRAY['farms:read','field-log:read','field-log:write','harvest:read','harvest:write'], true),
  (NULL, 'viewer', 'Lectura', 'Solo lectura',
    ARRAY['farms:read','field-log:read','phenology:read','health:read','harvest:read'], true)
ON CONFLICT (org_id, code) DO NOTHING;
