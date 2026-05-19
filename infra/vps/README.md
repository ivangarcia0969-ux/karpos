# Karpos en VPS

Stack: Postgres 16 + API Nest + Web Next + Caddy reverse proxy.
Aislado de Supabase y LibreChat. UFW no se toca.

## Aislamiento

| Recurso       | Supabase            | LibreChat           | Karpos                |
|---------------|---------------------|---------------------|-----------------------|
| Container PG  | `supabase-db`       | -                   | `karpos-postgres`     |
| Red Docker    | `supabase_default`  | -                   | `karpos-net`          |
| Puerto host   | `0.0.0.0:5432`      | -                   | `127.0.0.1:5433`      |
| Volumen       | `supabase_db_data`  | -                   | `karpos-pg`           |
| Caddy bloque  | `supabase.surcoapp.tech` | -              | `app.karpos.surcoapp.tech` |

## Instalar

DNS primero: `A app.karpos → IP del VPS`.

```bash
sudo git clone https://github.com/ivangarcia0969-ux/karpos.git /opt/karpos
sudo bash /opt/karpos/infra/vps/install.sh
```

El script:
1. Genera `/opt/karpos/.env` con password Postgres y JWT_SECRET aleatorios
2. Construye imágenes `karpos-api` y `karpos-web`
3. Levanta Postgres + corre migraciones + seeds
4. Levanta API + Web
5. Agrega bloque Caddy y recarga

## Verificar

```bash
docker ps --filter name=karpos
curl -fsS https://app.karpos.surcoapp.tech/v1/health
# abrir en navegador
open https://app.karpos.surcoapp.tech
```

## Conectarse a la DB desde tu PC

```bash
ssh -L 5433:127.0.0.1:5433 root@<IP>
# luego en DBeaver / pgAdmin:
#   host=localhost port=5433 db=karpos user=karpos pass=(ver /opt/karpos/.env)
```

## Backups

```bash
crontab -e
# añadir:
#   0 3 * * * /opt/karpos/infra/vps/backup.sh >> /var/log/karpos-backup.log 2>&1
```

## Apagar / borrar todo Karpos sin afectar el resto

```bash
docker compose --env-file /opt/karpos/.env \
  -f /opt/karpos/infra/vps/docker-compose.prod.yml down -v
docker rmi karpos-api:latest karpos-web:latest 2>/dev/null
rm -rf /opt/karpos
sed -i '/# Karpos (added by install.sh)/,+1d' /etc/caddy/Caddyfile
rm -f /etc/caddy/karpos.caddy
systemctl reload caddy
```
