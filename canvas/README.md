# Collaborative Canvas Prototype

This is a minimal scaffold for a real-time collaborative canvas application.
It uses **Flask** with **Flask-SocketIO** for the web server, **Redis** for
Pub/Sub messaging, and **PostgreSQL** for persistence. **Nginx** acts as a TLS
terminating reverse proxy.

## Structure

- `docker-compose.yml` - defines services for nginx, the Flask app, Redis, and PostgreSQL.
- `nginx/` - Dockerfile and config for the reverse proxy. Certificates should
  be placed in `nginx/letsencrypt`.
- `web/` - Flask application and dependencies.
- `db/` - Postgres image customization and initialization SQL.
- `init_db/schema.sql` - SQL schema for the `canvas_ops` table.

## Quick start (single VM)

1. Ensure Docker and Docker Compose are installed.
2. Place your TLS certificates under `nginx/letsencrypt` or set up certbot
   separately.
3. Run:

\`\`\`bash
docker compose build
docker compose up
\`\`\`

The Flask application will be available via HTTPS through Nginx.

## Scaling out

- Run multiple instances of the `web` service behind a load balancer.
- Use a shared Redis instance for WebSocket message queueing (the Flask-SocketIO
  `message_queue` option) so events propagate across instances.
- Use a managed PostgreSQL database for persistence.
- Nginx (or another proxy) should balance traffic across the `web` instances.

## Manual steps

- Obtain real TLS certificates for your domain using certbot or another ACME
  client and place them in `nginx/letsencrypt`.
- Adjust `nginx/default.conf` with your actual domain names.

## Environment variables

The `web` container uses the following variables (defined in `docker-compose.yml`):

- `DATABASE_URL` – SQLAlchemy connection URI.
- `REDIS_URL` – Redis connection string.
- `FLASK_ENV` – environment (development/production).

Adjust as needed for your environment.
