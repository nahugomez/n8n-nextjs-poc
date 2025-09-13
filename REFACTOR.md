
# Plantilla de Arquitectura Escalable para Next.js (App Router)

> Basado en **“The Complete Guide to Scalable Next.js Architecture” (Melvin Prince, 15 Jun 2025)** y mejores prácticas oficiales de Next.js. Esta guía es un README listo para usar al iniciar un proyecto nuevo y para mantener coherencia a medida que escala.

## Objetivos
- **Escalabilidad:** que la estructura no colapse cuando crezca el equipo/alcance.
- **Mantenibilidad:** decisiones explícitas, convenciones claras, linters y tests.
- **Performance por defecto:** server-first, caché y límites de cliente bien marcados.
- **Seguridad & observabilidad:** headers, rate‑limit, logs y métricas desde el día 1.

---

## Stack recomendado (opcional pero práctico)
- **Next.js 15 – App Router** + **TypeScript**
- **Tailwind CSS** (+ **shadcn/ui** para UI composable)
- **Zod** para validación en borde/servidor
- **Prisma** (si hay DB) + **PostgreSQL**
- **Auth**: NextAuth/Auth.js o sistema propio con cookies HttpOnly
- **TanStack Query** solo para **estado remoto en cliente** (cuando aplique)
- **Vitest + Testing Library + Playwright** (unit, component, e2e)
- **Biome/ESLint + Prettier + Husky + lint-staged**

> *Mantra:* **Server Components por defecto.** “use client” solo en los límites necesarios (interacciones, browser APIs, contextos de UI).

---

## Estructura de carpetas (App Router + colocation)

```
apps/mi-app/                      # si usás monorepo (turborepo), si no, raíz del repo
├─ app/                           # rutas (file‑system routing) + layouts
│  ├─ (marketing)/                # Route Group: público (no afecta URL)
│  │  ├─ layout.tsx
│  │  └─ page.tsx
│  ├─ (auth)/                     # Route Group: auth
│  │  ├─ signin/
│  │  │  └─ page.tsx
│  ├─ (dashboard)/                # Route Group: privadas
│  │  ├─ layout.tsx
│  │  ├─ page.tsx
│  │  └─ users/[id]/page.tsx
│  ├─ api/                        # Route Handlers (REST/RPC)
│  │  └─ users/route.ts
│  ├─ _components/                # **Privado** (prefijo “_” evita generar rutas)
│  │  ├─ ui/                      # piezas reusables (server‑first)
│  │  ├─ form/                    # formularios (server actions / client para UX)
│  │  └─ charts/                  # componentes “client” encapsulados
│  ├─ _features/                  # Feature slices (casos de uso/negocio)
│  │  └─ users/
│  │     ├─ components/
│  │     ├─ server/               # servicios/queries del feature (server‑only)
│  │     ├─ actions.ts            # server actions del feature
│  │     ├─ schemas.ts            # zod
│  │     └─ index.ts
│  ├─ _lib/                       # código compartido (server‑only por defecto)
│  │  ├─ db.ts                    # Prisma client
│  │  ├─ logger.ts                # pino/otel
│  │  └─ auth.ts                  # helpers de auth
│  ├─ _styles/                    # estilos globales
│  ├─ layout.tsx                  # root layout
│  └─ page.tsx                    # landing o home
├─ public/                        # assets estáticos
├─ prisma/                        # esquema y migraciones
├─ scripts/                       # tareas de CI/ops
├─ tests/                         # unit/component tests
├─ e2e/                           # e2e (Playwright)
├─ .env.example
└─ next.config.ts
```

**Notas de estructura**
- Usá **Route Groups** `()` para separar dominios funcionales sin afectar la URL.
- Prefijo **“_”** en carpetas privadas para evitar rutas (convención App Router).
- **Co‑location**: tests, estilos, stories y queries junto a su componente/feature.
- **Límites “use client”** en componentes hoja (inputs, gráficos, mapas, modales).

---

## Flujo de datos y caché (server‑first)
- **Fetch en Server Components** por defecto.
- **Caché y revalidación**: usar `fetch()` con opciones, `revalidatePath`, `revalidateTag` para invalidaciones dirigidas. Mantener contenido estático **PPR/SSG/ISR** donde tenga sentido.
- Encapsulá las lecturas en funciones del feature (`_features/.../server/queries.ts`) para reuso y deduplicación.
- **Actions en servidor** para mutaciones simples. Para mutaciones complejas o con UX rica, combiná **server actions** + **TanStack Query** en el cliente.
- Evitá stores globales; preferí **URL state** (search params), props y contextos locales.

### Patrón de módulo de datos (ejemplo)
```ts
// app/_features/users/server/queries.ts
import { cache } from "react";              // opcional para memoizar funciones
import { db } from "@/app/_lib/db";

export const getUser = cache(async (id: string) => {
  return db.user.findUnique({ where: { id } });
});
```

```ts
// app/(dashboard)/users/[id]/page.tsx (Server Component)
import { getUser } from "@/app/_features/users/server/queries";

export default async function UserPage({ params }: { params: { id: string } }) {
  const user = await getUser(params.id);
  // render...
}
```

---

## API interna (Route Handlers) y validación
- Preferí **Route Handlers** en `app/api/**/route.ts` para endpoints finos (REST o RPC).
- **Validación** con **Zod** en entrada/salida; devolvé errores tipados.
- **Auth**: cookies HttpOnly + `NextRequest`/`NextResponse`; tokens firmados en servidor.
- **Rate limit** en Edge/Node si el endpoint es público.
- Estructurá servicios de negocio en `app/_features/*/server` y mantené los handlers delgados.

```ts
// app/api/users/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { createUser } from "@/app/_features/users/server/actions";

const schema = z.object({ email: z.string().email(), name: z.string().min(1) });

export async function POST(req: Request) {
  const body = await req.json();
  const data = schema.parse(body);
  const user = await createUser(data);
  return NextResponse.json(user, { status: 201 });
}
```

---

## Componentes y UI
- **Server Components** para todo lo que sea renderizable sin estado del browser.
- **Client Components** encapsulados para interacción pesada (tablas virtualizadas, charts, mapas, editores).
- **Design System local** en `app/_components/ui`. Exportá **primitivas** (Button, Input…) y **compuestos** (Card, DataTable).

**Sugerencia UI**
- Tailwind preconfigurado; `shadcn/ui` para velocidad sin casarte con un lib complejo.
- **@next/third-parties** o `<Script>` para scripts externos con estrategia adecuada.

---

## Seguridad esencial
- **CSP** (Content-Security-Policy) estricto y **nonce** para inline scripts.
- Cookies **Secure + SameSite=strict + HttpOnly**.
- **Rate limit** en endpoints públicos (Upstash Redis/Edge Middleware).
- Sanitizá/validá entrada con **Zod** y usá `NextResponse.json()` siempre.

---

## Observabilidad
- Logs estructurados (pino/console) y traza con **OpenTelemetry** (`instrumentation.ts`).
- Métricas de Web Vitals y **Speed Insights** (opcional) para performance.

---

## Testing
- **Unit/Component (Vitest + Testing Library)**: colocá `*.test.ts(x)` junto al código.
- **E2E (Playwright)** en `/e2e` con fixtures de auth y datos.
- **CI**: jobs separados (lint → unit → e2e) y caché de build de Next.

---

## Scripts útiles (npm)
```jsonc
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "biome check . || eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "e2e": "playwright test",
    "prepare": "husky"
  }
}
```

---

## CI (GitHub Actions – ejemplo mínimo con caché de build)
```yaml
name: ci
on:
  pull_request:
  push: { branches: [main] }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'pnpm' }
      - run: corepack enable
      - run: pnpm i --frozen-lockfile
      - name: Restore Next.js cache
        uses: actions/cache@v4
        with:
          path: |
            .next/cache
            node_modules/.cache
          key: ${{ runner.os }}-next-${{ hashFiles('**/pnpm-lock.yaml') }}
      - run: pnpm build
      - run: pnpm test -w
```

---

## Checklist de calidad (copiar en PRs)
- [ ] Todas las rutas nuevas están dentro de un **Route Group**.
- [ ] Cada componente **client** justifica su existencia (necesita browser API/estado).
- [ ] Queries/mutaciones encapsuladas en `app/_features/**/server/*`.
- [ ] **Zod** en input/output de APIs y actions.
- [ ] Caché/revalidación definida (`fetch` options / `revalidatePath`/`revalidateTag`).
- [ ] CSP y headers de seguridad activos; cookies seguras.
- [ ] Tests y tipos pasando; **build** reproducible en CI con caché.
- [ ] Métricas y logs disponibles.

---

## Arranque rápido
```bash
pnpm dlx create-next-app@latest mi-app   --typescript --eslint --tailwind --app --src-dir --import-alias "@/*"

cd mi-app
pnpm add zod @tanstack/react-query
pnpm add -D vitest @testing-library/react jsdom @types/node @types/react            @playwright/test @biomejs/biome eslint prettier husky lint-staged
```

**Tailwind**: `globals.css` con reset, fuentes y tema.  
**shadcn/ui**: instalar CLI y generar componentes de base.

---

## Monorepo (opcional)
- Usa **Turborepo**: `apps/web`, `packages/ui`, `packages/config`, `packages/tsconfig`.
- Reutilizá **Design System** y configs compartidas; cachea builds con `turbo` remoto.

---

## Decisiones clave (resumen tipo “árbol de elección”)
- **¿PPR/SSG/SSR?**  
  - **Contenido estable** → **SSG** + ISR.  
  - **Datos por usuario** → **SSR (RSC)** + caché de datos.  
  - **Primera carga rápida + streaming** → **PPR**.  
- **¿Estado global en cliente?**  
  - Evitá si podés; usá **server actions** + **URL state**.  
  - Si necesitás cache cliente (invalidaciones, refetch) → **TanStack Query**.  
- **¿API interna?**  
  - Route Handlers delgados + **Zod** + servicios en `server/`.  
  - **Edge** para latencias bajas y rate‑limit simple.  

---

## Convenciones
- Imports absolutos vía alias `@/*`.
- Nombres de archivos en **kebab-case**; componentes en **PascalCase**.
- Un componente por archivo, exportación por defecto solo si es página/layout.
- Comentarios **JSDoc** para módulos de server y contratos de API.

---

## Enlaces de referencia rápidos
- Docs App Router, caché/revalidación, scripts de terceros, CSP, producción.
- Ejemplos de rate‑limit y CI cache.

---

### Licencia
Este README puede copiarse/adaptarse en tus repos internos.
