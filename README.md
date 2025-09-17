# n8n-nextjs-poc

## Docker

Este proyecto está preparado para ejecutarse con Docker usando imágenes multi-stage y salida `standalone` de Next.js.

### Requisitos
- Docker (y Docker Compose v2)
- Node 20+ solo si deseas ejecutar localmente sin Docker

### Variables de entorno
- Copia `.env.example` a `.env.local` para desarrollo y a `.env.production` para producción.
- Ajusta `N8N_WEBHOOK_URL` según tu entorno.

### Desarrollo
Levanta el entorno de desarrollo con hot-reload:

```bash
docker compose up next-dev
```

- El código local se monta dentro del contenedor (`.:/app`).
- `node_modules` se mantiene en un volumen para evitar conflictos.
- La app queda disponible en http://localhost:3000

Si estás en Windows, se recomienda WSL2 para mejor rendimiento de file-watching.

### Producción
Construye y levanta la imagen optimizada (standalone):

```bash
# build de la imagen (target runner)
docker compose build next-prod
# levantar en segundo plano
docker compose up -d next-prod
# logs
docker compose logs -f next-prod
```

La app quedará disponible en http://localhost:3000

### Notas
- El `Dockerfile` usa `pnpm` vía Corepack y bloquea versiones con `pnpm-lock.yaml`.
- La salida `standalone` de Next.js copia sólo las dependencias necesarias para runtime, reduciendo el tamaño de la imagen final.
- Para deploy en registries (GHCR, Docker Hub), puedes etiquetar la imagen con `--tag` y hacer `docker push`.
