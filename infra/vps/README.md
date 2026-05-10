# Karpos en VPS Hostinger

Despliegue de Karpos en un VPS Hostinger compartido con otras apps (Supabase ya existente). **No toca la otra app.**

## Aislamiento garantizado

| Recurso              | Tu Supabase                 | Karpos                                       |
|----------------------|-----------------------------|----------------------------------------------|
| Carpeta              | `/opt/supabase/`            | `/opt/karpos/` (nueva)                       |
| Container Postgres   | `supabase-db`               | `karpos-postgres`                            |
| Red Docker           | `supabase_default`          | `karpos-net`                                 |
| Puerto host          | `0.0.0.0:5432` (expuesto)   | sin puerto en host, solo red interna         |
| Volumen              | `supabase_db_data`          | `karpos-pg`                                  |
| Versión Postgres     | 15.x                         | 16 + TimescaleDB + PostGIS + pgvector        |

Cero contacto entre las dos.

## Topología

```
internet
  │
  ▼
Caddy (sistema, /usr/bin/caddy, escuchando :80 y :443)
  ├── supabase.surcoapp.tech            → 127.0.0.1:8000   (tu Supabase, intacto)
  └── cultivarapp.karpos.surcoapp.tech  →  /v1/*  → 127.0.0.1:4100 (api Karpos)
                                          else   → 127.0.0.1:3100 (web Karpos)

Docker (red karpos-net):
  postgres ─┐
  redis ────┤
  minio ────┼─→ api (4000) ─→ Ollama del host (host.docker.internal:11434)
  ml ───────┘
```

## Primer despliegue (en el VPS, como root)

```bash
# 1. DNS: hPanel → Dominios → surcoapp.tech → Registros DNS
#    Tipo A   nombre cultivarapp.karpos    valor IP_DEL_VPS    TTL 3600
#    (opcional) Tipo A  nombre *.karpos    valor IP_DEL_VPS    para subdominios futuros
#
# 2. Bootstrap
curl -fsSL https://raw.githubusercontent.com/<TU_GH>/karpos/main/infra/vps/install.sh | sudo bash
# o si ya cloneaste: sudo bash /opt/karpos/infra/vps/install.sh

# 3. Verificar
curl -fsS https://cultivarapp.karpos.surcoapp.tech/health
```

## Karpos IQ con Ollama local

`docker-compose.prod.yml` configura `OLLAMA_URL=http://host.docker.internal:11434` y `OLLAMA_MODEL=llama3.1`. El API llama al Ollama del host directamente. Costo cero, los datos del tenant nunca salen del VPS.

Si querés cambiar el modelo:
```bash
echo "OLLAMA_MODEL=qwen2.5:1.5b" >> /opt/karpos/.env
docker restart karpos-api
```

Si Ollama no está disponible, el copiloto cae a un stub textual con citas (no es error fatal).

## Operación

```bash
# Logs en vivo
docker compose -f /opt/karpos/infra/vps/docker-compose.prod.yml logs -f api web

# Redeploy (pull + rebuild + migrate + restart)
bash /opt/karpos/infra/vps/deploy.sh

# Backup manual
bash /opt/karpos/infra/vps/backup.sh

# Cron de backup nightly (3:00 UTC)
crontab -e
# añadir:
#   0 3 * * * /opt/karpos/infra/vps/backup.sh >> /var/log/karpos-backup.log 2>&1

# psql contra Karpos (NO contra Supabase)
docker exec -it karpos-postgres psql -U karpos -d karpos
```

## Recursos esperados (KVM 8: 32 GB / 8 vCPU)

| Servicio       | RAM idle | RAM bajo carga |
|----------------|----------|----------------|
| postgres       | 200 MB   | 1-2 GB         |
| redis          | 50 MB    | 200 MB         |
| minio          | 100 MB   | 300 MB         |
| api (Nest)     | 150 MB   | 500 MB         |
| web (Next)     | 200 MB   | 600 MB         |
| ml (FastAPI + e5-large) | 1.2 GB | 1.5 GB |
| Ollama (host, llama3.1 cargado) | 0 (lazy) | 5-6 GB |
| **Total Karpos** | ~2 GB | ~5 GB sin LLM, +6 GB con LLM cargado |

Sobra holgado en KVM 8. Tenés ~20 GB libres para Supabase, otras apps y picos.

## Endurecimiento opcional (recomendado, no aplicado por install.sh)

1. **Cerrar Postgres público de Supabase** (independiente de Karpos):
   ```bash
   ufw allow 22/tcp
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw deny 5432/tcp
   ufw deny 6543/tcp
   ufw enable
   ```
2. **Fail2ban** para SSH.
3. **Backups de Supabase** (responsabilidad propia, no de Karpos).
4. **Monitoreo**: añadir `node_exporter` y conectar a un Grafana Cloud free tier.

## Rollback

```bash
cd /opt/karpos
git log --oneline -10            # ubicar el commit anterior
git checkout <SHA>
bash infra/vps/deploy.sh
# si rompió la DB: restaurar pg_dump
gunzip -c /var/backups/karpos/karpos-YYYYMMDD-HHMMSSZ.sql.gz | \
  docker exec -i karpos-postgres psql -U karpos -d karpos
```

## Apagar Karpos sin afectar Supabase

```bash
docker compose -f /opt/karpos/infra/vps/docker-compose.prod.yml down
# remover bloque Karpos del Caddyfile y reload
sed -i '/# Karpos (added by install.sh)/,/import \/etc\/caddy\/karpos.caddy/d' /etc/caddy/Caddyfile
systemctl reload caddy
# Supabase queda intacto.
```
