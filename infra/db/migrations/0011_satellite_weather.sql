-- 0011_satellite_weather.sql
-- EcoSat (satellite indices) + Clima Local (weather stations and observations).

CREATE TABLE karpos.satellite_indices (
  org_id          uuid NOT NULL,
  plot_id         uuid NOT NULL,
  observed_on     date NOT NULL,
  source          text NOT NULL,
  index_code      text NOT NULL CHECK (index_code IN ('NDVI','NDRE','NDMI','EVI','SAVI','GNDVI','LAI')),
  mean            numeric(8,4),
  median          numeric(8,4),
  p10             numeric(8,4),
  p90             numeric(8,4),
  std_dev         numeric(8,4),
  cloud_cover_pct numeric(5,2),
  raster_url      text,
  PRIMARY KEY (org_id, plot_id, observed_on, index_code, source)
);
SELECT create_hypertable('karpos.satellite_indices', 'observed_on', chunk_time_interval => INTERVAL '180 days', if_not_exists => TRUE);
CREATE INDEX ON karpos.satellite_indices(plot_id, index_code, observed_on DESC);

CREATE TABLE karpos.weather_stations (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  external_id     text,
  vendor          text,
  model           text,
  name            text NOT NULL,
  geom            geography(Point, 4326) NOT NULL,
  elevation_m     int,
  installed_at    date,
  active          boolean NOT NULL DEFAULT true,
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON karpos.weather_stations(org_id) WHERE active = true;
CREATE INDEX ON karpos.weather_stations USING gist(geom);

CREATE TABLE karpos.weather_observations (
  station_id      uuid NOT NULL,
  observed_at     timestamptz NOT NULL,
  temp_c          numeric(5,2),
  rh_pct          numeric(5,2),
  rain_mm         numeric(7,2),
  wind_speed_ms   numeric(5,2),
  wind_dir_deg    numeric(5,1),
  solar_w_m2      numeric(7,2),
  pressure_hpa    numeric(7,2),
  leaf_wetness_min int,
  raw             jsonb,
  PRIMARY KEY (station_id, observed_at)
);
SELECT create_hypertable('karpos.weather_observations', 'observed_at', chunk_time_interval => INTERVAL '7 days', if_not_exists => TRUE);
ALTER TABLE karpos.weather_observations SET (timescaledb.compress, timescaledb.compress_segmentby = 'station_id', timescaledb.compress_orderby = 'observed_at DESC');
SELECT add_compression_policy('karpos.weather_observations', INTERVAL '30 days', if_not_exists => TRUE);

CREATE TABLE karpos.weather_forecasts (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  station_id      uuid,
  org_id          uuid,
  plot_id         uuid,
  forecast_for    timestamptz NOT NULL,
  generated_at    timestamptz NOT NULL,
  source          text NOT NULL,
  temp_c          numeric(5,2),
  rh_pct          numeric(5,2),
  rain_mm         numeric(7,2),
  wind_speed_ms   numeric(5,2),
  frost_risk_pct  numeric(5,2),
  payload         jsonb
);
CREATE UNIQUE INDEX weather_forecasts_uniq
  ON karpos.weather_forecasts (forecast_for, generated_at, source, COALESCE(station_id, plot_id));

CREATE TABLE karpos.alerts (
  id              uuid PRIMARY KEY DEFAULT uuid_v7(),
  org_id          uuid NOT NULL REFERENCES karpos.organizations(id) ON DELETE CASCADE,
  scope_type      text NOT NULL CHECK (scope_type IN ('farm','plot','zone','organization')),
  scope_id        uuid NOT NULL,
  topic           text NOT NULL,             -- e.g. 'frost_risk','disease_model','phi_violation'
  severity        text NOT NULL CHECK (severity IN ('info','warning','critical')),
  title           text NOT NULL,
  message         text NOT NULL,
  payload         jsonb NOT NULL DEFAULT '{}'::jsonb,
  delivered       jsonb NOT NULL DEFAULT '{}'::jsonb,
  triggered_at    timestamptz NOT NULL DEFAULT now(),
  acknowledged_at timestamptz,
  acknowledged_by uuid REFERENCES karpos.users(id)
);
CREATE INDEX ON karpos.alerts(org_id, severity, triggered_at DESC);
CREATE INDEX ON karpos.alerts(scope_type, scope_id) WHERE acknowledged_at IS NULL;
