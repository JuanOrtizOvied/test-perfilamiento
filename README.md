# Test Perfil Sabbi

Aplicación web del **Test de Perfilamiento de inversionista de Sabbi**: un
cuestionario por bloques (estilo Typeform) que, a partir de las respuestas del
usuario, calcula su **perfil de inversionista** y lo presenta en pantalla.

El resultado combina dos ejes:

- **Arquetipo** — 13 perfiles (`A1`…`A12`, p. ej. _"El Iniciador"_), con sus
  fortalezas, puntos ciegos y descripción.
- **Capacidad financiera** — 5 niveles (`C1`…`C5`) y un **portafolio
  recomendado** acorde a esa capacidad.

Además incluye pantallas intermedias con "recall" de respuestas previas, barra de
progreso, **reanudar donde lo dejaste** (persistencia en `localStorage`), envío
de _snapshots_ de avance al backend, envío del resultado a un webhook y
**descarga del resultado como imagen PNG**.

> El motor de scoring (arquetipo + capacidad) está portado desde el HTML original
> y vive en `src/features/profile-test/utils/scoring.ts`. La especificación del
> sistema está en `context-profile/sistema-perfil-sabbi.md`.

**Stack:** React 19 · Vite 8 · TypeScript 6 · Tailwind CSS 4 (+ Radix/shadcn) ·
zod 4 · Vitest 4 (+ Testing Library / jsdom / MSW).

---

## Requisitos

- **Node 24** — fijado en `.nvmrc` y en `engines` (`>=24 <25`). Con
  `engine-strict=true` (`.npmrc`), `pnpm install` **falla** si tu Node está fuera
  de rango.
- **pnpm 11** — es el gestor de paquetes del proyecto (`packageManager` fijado en
  `package.json`). Se habilita con Corepack.

## Instalación de librerías

```bash
nvm use                  # usa Node 24 (lee .nvmrc)
corepack enable pnpm     # habilita pnpm sin instalarlo a mano
pnpm install             # instala todas las dependencias
```

> Si no usas nvm, asegúrate de tener Node 24 activo antes de instalar. Usa
> **pnpm** (no `npm` ni `yarn`): el lockfile es `pnpm-lock.yaml`.

## Variables de entorno

Copia el ejemplo y ajústalo (los `.env*` están gitignoreados salvo `.env.example`):

```bash
cp .env.example .env.local
```

Se validan con **zod** al arrancar en `src/packages/config/env.ts`; si falta o es
inválida una variable **requerida**, la app lanza un error ruidoso al iniciar.

| Variable                        | Requerida | Descripción                                                              |
| ------------------------------- | --------- | ------------------------------------------------------------------------ |
| `VITE_APP_ENV`                  | sí        | Entorno: `local` \| `staging` \| `production`                            |
| `VITE_API_URL`                  | sí        | URL base de la API (cliente axios + registro de avance). Debe ser válida |
| `VITE_GA_ID`                    | no        | Measurement id de Google Analytics (vacío por defecto)                   |
| `VITE_PROFILE_TEST_WEBHOOK_URL` | no        | Webhook del resultado final; si queda vacío, no se envía                 |

## Inicializar el proyecto

```bash
pnpm dev
```

Levanta el servidor de desarrollo de Vite en **http://localhost:5001** (con HMR).
Es la forma normal de trabajar en local.

Para un build de producción y previsualizarlo:

```bash
pnpm build     # tsc -b (type-check estricto) + vite build → dist/
pnpm preview   # sirve el build de dist/ localmente
```

## Scripts

| Script               | Descripción                                       |
| -------------------- | ------------------------------------------------- |
| `pnpm dev`           | Servidor de desarrollo (Vite) en `:5001`          |
| `pnpm build`         | `tsc -b && vite build` (type-check + bundle)      |
| `pnpm preview`       | Sirve el build de producción                      |
| `pnpm lint`          | ESLint (flat config, incluye `import-x/no-cycle`) |
| `pnpm lint:fix`      | ESLint con `--fix`                                |
| `pnpm format`        | Prettier (`--write`)                              |
| `pnpm typecheck`     | `tsc -b` (solo type-check)                        |
| `pnpm test`          | Vitest (una pasada)                               |
| `pnpm test:watch`    | Vitest en modo watch                              |
| `pnpm test:coverage` | Vitest con cobertura (v8)                         |

## Testing

Suite con **Vitest + Testing Library + jsdom**, en `tests/` (fuera de `src/`,
espejando su estructura). Las llamadas de red se simulan con **MSW** (solo en
tests; en dev la app pega al backend real de `VITE_API_URL`).

```bash
pnpm test
```

## Estructura

```
src/
  core/                     # tipos de dominio + barrels (@/core)
    types/profile-test/
  features/
    profile-test/           # el feature completo del test
      api/                  # submitResult, submitProgress, registerSabbiTestQuestionApi
      constants/            # questions, archetypes, capacities, scoring, copy, ...
      hooks/                # useProfileTest, profileTestReducer, useResultActions, ...
      molecules/ organisms/ pages/   # UI (ProfileTestPage y sus bloques)
      utils/                # scoring, validation, recall, savedProgress, resultImage, ...
  packages/
    config/                 # env.ts (zod), http/ (cliente axios)
    design/                 # design system propio (ui, atoms, templates)
    lib/                    # utils (cn), helpers
  routes/                   # router.tsx (ruta única → ProfileTestPage, lazy)
  App.tsx                   # monta <RouterProvider>
  main.tsx                  # entrypoint (createRoot → App)
assets/                     # PNG de arquetipos, logo (fuera de src)
tests/                      # suite completa + MSW (fuera de src)
context-profile/            # documentación del sistema de perfilamiento
```

### Convención de imports

- Alias `@/*` → `src/*`, `@assets/*` → `assets/*`, `@tests/*` → `tests/*`
  (definidos en `vite.config.ts` y en los `tsconfig.*.json`). `@tests/*` solo se
  usa dentro de `tests/`.
- Import absoluto directo al módulo hoja; **barrels solo por carpeta hoja**, sin
  barrels globales.
- `import-x/no-cycle` en nivel **error**: no se permiten ciclos de importación.

## CI

`.github/workflows/ci.yml` corre **lint + test + build** con pnpm y Node 24 en
cada push a `main` y en cada PR, sin credenciales ni servicios externos.
