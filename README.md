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
de _snapshots_ de avance al backend, envío del resultado a dos webhooks y
**descarga del resultado como imagen PNG**.

> El motor de scoring (arquetipo + capacidad) está portado desde el HTML original
> y vive en `src/features/profile-test/utils/scoring.ts`. La especificación del
> sistema está en `context-profile/sistema-perfil-sabbi.md`.

**Stack:** React 19 · Vite 8 · TypeScript 6 · Tailwind CSS 4 (+ Radix/shadcn) ·
zod 4 · Vitest 4 (+ Testing Library / jsdom / MSW).

---

## Requisitos

- **Node 24** — fijado en `.nvmrc` y en `engines` (`>=24 <25`). Yarn Classic
  valida `engines` por defecto: `yarn install` **falla** si tu Node está fuera
  de rango.
- **Yarn 1 (Classic)** — es el gestor de paquetes del proyecto (`packageManager`
  fijado en `package.json`). Se habilita con Corepack o `brew install yarn`.

## Instalación de librerías

```bash
nvm use                  # usa Node 24 (lee .nvmrc)
corepack enable yarn     # habilita yarn sin instalarlo a mano
yarn install             # instala todas las dependencias
```

> Si no usas nvm, asegúrate de tener Node 24 activo antes de instalar. Usa
> **yarn** (no `npm` ni `pnpm`): el lockfile es `yarn.lock`. Para reinstalar
> desde cero usa `yarn bootstrap` (borra `node_modules` y vuelve a instalar).

## Variables de entorno

Copia el ejemplo y ajústalo (los `.env*` están gitignoreados salvo `.env.example`):

```bash
cp .env.example .env.local
```

Se validan con **zod** al arrancar en `src/packages/config/env.ts`; si falta o es
inválida una variable **requerida**, la app lanza un error ruidoso al iniciar.

| Variable                              | Requerida | Descripción                                                               |
| ------------------------------------- | --------- | ------------------------------------------------------------------------- |
| `VITE_APP_ENV`                        | sí        | Entorno: `local` \| `staging` \| `production`                             |
| `VITE_API_URL`                        | sí        | URL base de la API (cliente axios + registro de avance). Debe ser válida  |
| `VITE_GA_ID`                          | no        | Measurement id de Google Analytics (vacío por defecto)                    |
| `VITE_PROFILE_TEST_WEBHOOK_URL`       | no        | Webhook del resultado final; si queda vacío, no se envía                  |
| `VITE_PROFILE_TEST_EXCEL_WEBHOOK_URL` | no        | Webhook que vuelca las preguntas a un Excel; mismo cuerpo que el anterior |

## Inicializar el proyecto

```bash
yarn dev
```

Levanta el servidor de desarrollo de Vite en **http://localhost:5001** (con HMR;
`--host` lo expone también en la red local). Es la forma normal de trabajar.

Para un build de producción y previsualizarlo:

```bash
yarn build     # vite build → dist/
yarn preview   # sirve el build de dist/ localmente
```

> `yarn build` no typechequea: el type-check estricto vive en `yarn typecheck`
> (y corre en CI).

## Scripts

| Script               | Descripción                                               |
| -------------------- | --------------------------------------------------------- |
| `yarn dev`           | Servidor de desarrollo (Vite) en `:5001`, con `--host`    |
| `yarn build`         | Build de producción (`vite build`) → `dist/`              |
| `yarn preview`       | Sirve el build de producción                              |
| `yarn bootstrap`     | `rm -rf node_modules && yarn install` (desde cero)        |
| `yarn lint`          | ESLint estricto (`--max-warnings 0`, `import-x/no-cycle`) |
| `yarn lint:fix`      | ESLint con `--fix`                                        |
| `yarn format`        | Prettier (`--write`)                                      |
| `yarn typecheck`     | `tsc -b` (solo type-check)                                |
| `yarn test`          | Vitest (una pasada)                                       |
| `yarn test:watch`    | Vitest en modo watch                                      |
| `yarn test:coverage` | Vitest con cobertura (v8)                                 |

## Testing

Suite con **Vitest + Testing Library + jsdom**, en `tests/` (fuera de `src/`,
espejando su estructura). Las llamadas de red se simulan con **MSW** (solo en
tests; en dev la app pega al backend real de `VITE_API_URL`).

```bash
yarn test
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

`.github/workflows/ci.yml` corre **lint + typecheck + test + build** con yarn y
Node 24 en cada push a `main` y en cada PR, sin credenciales ni servicios
externos.
