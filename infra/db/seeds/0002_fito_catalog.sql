-- 0002_fito_catalog.sql
-- Productos fitosanitarios registrados ICA Colombia (extracto para demo).
-- Datos basados en el Registro Nacional de Plaguicidas Químicos de Uso Agrícola del ICA.
-- TODO: verificar y completar contra la última base ICA antes de promesa comercial.

INSERT INTO catalog.fito_products
  (commercial_name, active_ingredient, registration_no, formulation_type, category, toxicology_class,
   default_phi_days, default_rei_hours, recommended_dose_min, recommended_dose_max, dose_unit,
   target_pests, target_crops, mode_of_action, group_code, manufacturer, notes)
VALUES
  -- Fungicidas
  ('Score 250 EC',      'Difenoconazol',                        'ICA-5601',  'EC',  'fungicide',   'III', 14, 24, 0.3, 0.5, 'L/ha',
   ARRAY['Antracnosis','Roya','Mancha foliar'],
   ARRAY['mango','citrus_orange','citrus_lime','avocado','grape'],
   'Inhibidor de la biosíntesis de ergosterol', 'FRAC 3', 'Syngenta',
   'Sistémico de amplio espectro. Útil en pre-cosecha de mango contra antracnosis.'),

  ('Amistar Top 325 SC','Azoxistrobin + Difenoconazol',         'ICA-7211',  'SC',  'fungicide',   'III', 14, 24, 0.5, 0.75, 'L/ha',
   ARRAY['Antracnosis','Oídio','Mildiu'],
   ARRAY['citrus_lime','citrus_orange','mango','avocado'],
   'Combinación estrobilurina + triazol', 'FRAC 11+3', 'Syngenta',
   'Doble modo de acción. Excelente residualidad.'),

  ('Tilt 250 EC',       'Propiconazol',                         'ICA-2031',  'EC',  'fungicide',   'III', 21, 24, 0.4, 0.6, 'L/ha',
   ARRAY['Cercospora','Roya','Oídio'],
   ARRAY['banana','citrus_orange','grape'],
   'Triazol sistémico', 'FRAC 3', 'Syngenta', NULL),

  ('Phyton 27',         'Sulfato de cobre pentahidratado',      'ICA-3122',  'SL',  'bactericide', 'II',  14, 24, 1.0, 2.0, 'L/ha',
   ARRAY['Phytophthora','Cancrosis','Bacteriosis'],
   ARRAY['avocado','citrus_orange','citrus_lime','passion_fruit'],
   'Cobre sistémico', NULL, 'Phyton Corporation',
   'Curativo + preventivo para enfermedades fúngicas y bacterianas.'),

  ('Manzate 200 WP',    'Mancozeb',                             'ICA-0712',  'WP',  'fungicide',   'IV',  7,  24, 2.0, 3.5, 'kg/ha',
   ARRAY['Mildiu','Antracnosis','Tizón'],
   ARRAY['banana','grape','mango','papaya'],
   'Ditiocarbamato de contacto', 'FRAC M03', 'UPL',
   'Multisitio, sin riesgo de resistencia. Económico.'),

  ('Cabrio Star',       'Pyraclostrobin + Metiram',             'ICA-8104',  'WG',  'fungicide',   'III', 14, 24, 1.5, 2.5, 'kg/ha',
   ARRAY['Roya','Antracnosis','Mancha foliar'],
   ARRAY['banana','mango','avocado'],
   'Estrobilurina + multisitio', 'FRAC 11+M03', 'BASF', NULL),

  ('Trichoderma WP',    'Trichoderma harzianum',                'ICA-9854',  'WP',  'biological',  'IV',  0,  4,  1.0, 3.0, 'kg/ha',
   ARRAY['Phytophthora','Rhizoctonia','Fusarium','Sclerotinia'],
   ARRAY['avocado','citrus_orange','citrus_lime','mango','strawberry'],
   'Biocontrolador de patógenos del suelo', NULL, 'Biotecnología y Bioservicios',
   'Producto biológico. PHI = 0. Compatible con producción orgánica.'),

  -- Insecticidas
  ('Confidor 350 SC',   'Imidacloprid',                         'ICA-4011',  'SC',  'insecticide', 'II',  21, 12, 0.3, 0.5, 'L/ha',
   ARRAY['Diaphorina citri','Áfidos','Mosca blanca','Trips'],
   ARRAY['citrus_orange','citrus_lime','avocado','mango'],
   'Neonicotinoide sistémico', 'IRAC 4A', 'Bayer',
   'Control de vector HLB en cítricos. Sistémico de larga residualidad.'),

  ('Lorsban 4 EC',      'Clorpirifos',                          'ICA-1244',  'EC',  'insecticide', 'II',  21, 48, 0.75, 1.5, 'L/ha',
   ARRAY['Anastrepha','Ceratitis','Heliothis','Spodoptera'],
   ARRAY['mango','avocado','citrus_orange','passion_fruit'],
   'Organofosforado de amplio espectro', 'IRAC 1B', 'Corteva',
   'Cuidado con apicultores cercanos. PHI estricto.'),

  ('Karate Zeon 5 CS',  'Lambda-cihalotrina',                   'ICA-2841',  'CS',  'insecticide', 'II',  14, 24, 0.15, 0.3, 'L/ha',
   ARRAY['Lepidópteros','Heliothis','Spodoptera','Trips'],
   ARRAY['mango','citrus_orange','citrus_lime','avocado','strawberry'],
   'Piretroide encapsulado', 'IRAC 3A', 'Syngenta',
   'Encapsulación que reduce riesgo al operador.'),

  ('Talstar 100 EC',    'Bifentrina',                           'ICA-4427',  'EC',  'insecticide', 'II',  14, 24, 0.2, 0.4, 'L/ha',
   ARRAY['Ácaros','Lepidópteros','Coleópteros'],
   ARRAY['avocado','mango','citrus_orange','grape'],
   'Piretroide con acción acaricida', 'IRAC 3A', 'FMC', NULL),

  ('Movento 150 OD',    'Spirotetramat',                        'ICA-7892',  'OD',  'insecticide', 'III', 14, 12, 0.5, 0.75, 'L/ha',
   ARRAY['Cochinilla','Mosca blanca','Áfidos'],
   ARRAY['citrus_orange','citrus_lime','mango','avocado'],
   'Inhibidor de biosíntesis de lípidos', 'IRAC 23', 'Bayer',
   'Movilidad ambimobile en planta. Buen perfil ambiental.'),

  ('Tracer 480 SC',     'Spinosad',                             'ICA-6190',  'SC',  'insecticide', 'IV',  3,  4,  0.1, 0.25, 'L/ha',
   ARRAY['Tuta','Lepidópteros','Trips','Mosca de la fruta'],
   ARRAY['mango','citrus_orange','citrus_lime','strawberry','avocado'],
   'Naturalyte (origen Saccharopolyspora spinosa)', 'IRAC 5', 'Corteva',
   'Apto para manejo integrado. PHI corto.'),

  -- Acaricidas
  ('Vertimec 1.8 EC',   'Abamectina',                           'ICA-3506',  'EC',  'acaricide',   'II',  14, 24, 0.5, 1.0, 'L/ha',
   ARRAY['Ácaros','Minadores','Trips'],
   ARRAY['citrus_orange','citrus_lime','avocado','strawberry'],
   'Antibiótico glicosídico', 'IRAC 6', 'Syngenta',
   'Translaminar. No mezclar con cobres.'),

  ('Nissorun 10 WP',    'Hexitiazox',                           'ICA-5210',  'WP',  'acaricide',   'III', 21, 24, 0.3, 0.5, 'kg/ha',
   ARRAY['Ácaros (huevos y juveniles)'],
   ARRAY['citrus_orange','citrus_lime','grape','strawberry'],
   'Inhibidor de crecimiento de ácaros', 'IRAC 10A', 'Nihon Nohyaku', NULL),

  -- Herbicidas
  ('Roundup 480 SL',    'Glifosato',                            'ICA-1015',  'SL',  'herbicide',   'IV',  14, 4,  1.5, 3.5, 'L/ha',
   ARRAY['Malezas gramíneas y de hoja ancha'],
   ARRAY['avocado','citrus_orange','citrus_lime','mango','banana'],
   'Inhibidor de EPSPS', 'HRAC 9', 'Bayer',
   'No selectivo. Cuidado con deriva sobre cultivo.'),

  ('Goal 2 XL',         'Oxifluorfen',                          'ICA-4280',  'EC',  'herbicide',   'III', 30, 24, 0.5, 1.5, 'L/ha',
   ARRAY['Malezas de hoja ancha'],
   ARRAY['citrus_orange','citrus_lime','avocado','mango'],
   'Inhibidor de PPO', 'HRAC 14', 'Corteva', NULL),

  -- Reguladores y nutrición foliar
  ('Promalin',          'Giberelinas A4+A7 + Citoquininas',     'ICA-8401',  'SL',  'plant_growth_regulator','IV', 0, 4, 0.5, 1.0, 'L/ha',
   ARRAY['Mejora calibre y forma de fruto'],
   ARRAY['apple','pear','citrus_orange'],
   'Regulador fisiológico', NULL, 'Valent BioSciences',
   'Aplicación post-floración.'),

  ('NitroBoost Foliar', 'Nitrato de potasio + Boro',            'ICA-9921',  'SL',  'fertilizer',  'IV',  0,  4,  3.0, 8.0, 'L/ha',
   ARRAY['Nutrición foliar'],
   ARRAY['avocado','mango','citrus_orange','citrus_lime'],
   'Aporte N + K + B foliar', NULL, 'Yara',
   'Para refuerzo en floración y cuajado.'),

  ('Tween 80',          'Polisorbato 80',                       'ICA-6611',  'SL',  'adjuvant',    'IV',  0,  4,  0.25, 0.5, 'L/100L',
   ARRAY['Coadyuvante'],
   ARRAY['avocado','citrus_orange','citrus_lime','mango','grape','banana'],
   'Tensoactivo no iónico', NULL, 'Genérico',
   'Mejora cobertura y adherencia. Combinar con fungicidas/insecticidas.')
ON CONFLICT (commercial_name) DO NOTHING;
