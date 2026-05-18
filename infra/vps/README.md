# Karpos DB en el VPS

**Sólo Postgres.** Sin API, sin web, sin Ollama, sin Caddy. La app se conectará
a esta base cuando esté lista.

## Aislamiento de Supabase

| Recurso       | Supabase            | Karpos                |
|---------------|---------------------|-----------------------|
| Container     | `supabase-db`       | `karpos-postgres`     |
| Red Docker    | `supabase_default`  | `karpos-net`          |
| Puerto host   | `0.0.0.0:5432`      | `127.0.0.1:5433`      |
| Volumen       | `supabase_db_data`  | `karpos-pg`           |
| Versión       | 15.x                | 16-alpine             |

Cero contacto.

## Instalar

```bash
sudo bash /opt/karpos/infra/vps/install.sh
```

Si es la primera vez:
```bash
sudo git clone https://github.com/ivangarcia0969-ux/karpos.git /opt/karpos
sudo bash /opt/karpos/infra/vps/install.sh
```

El script crea `/opt/karpos/.env` con un password aleatorio, levanta Postgres
en `127.0.0.1:5433`, aplica `0001_init.sql` y siembra el catálogo.

## Verificar

```bash
docker ps --filter name=karpos
docker exec -it karpos-postgres psql -U karpos -d karpos -c '\dt karpos.*'
docker exec -it karpos-postgres psql -U karpos -d karpos -c 'SELECT count(*) FROM catalog.crop_species'
```

## Conectarse desde tu máquina (SSH tunnel)

```bash
# Local:
ssh -L 5433:127.0.0.1:5433 root@<IP_DEL_VPS>
# Después, en cualquier cliente Postgres:
#   host=localhost  port=5433  db=karpos  user=karpos  pass=(ver /opt/karpos/.env)
```

## Backup nightly

```bash
crontab -e
# añadir:
#   0 3 * * * /opt/karpos/infra/vps/backup.sh >> /var/log/karpos-backup.log 2>&1
```

## Apagar sin afectar Supabase

```bash
docker compose -f /opt/karpos/infra/vps/docker-compose.prod.yml down
```

## Borrar TODO

```bash
docker compose --env-file /opt/karpos/.env -f /opt/karpos/infra/vps/docker-compose.prod.yml down -v
docker rmi postgres:16-alpine node:20-alpine 2>/dev/null
rm -rf /opt/karpos
```

Supabase no se toca en ningún caso.
