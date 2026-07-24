# Design system

Atomic design con criterio documentado. Regla de decisión rápida:

- **`ui/`** — componentes generados/adaptados de **shadcn** (Radix + CVA + tokens).
  Primitiva técnica, sin semántica de la app. `components.json` apunta aquí.
  Se pueden editar; documentar los cambios sobre lo generado.
- **`atoms/`** — wrappers simples **propios** con semántica de la app sobre una
  primitiva o un elemento HTML (`SectionTitle`, `TextLink`). Un solo concepto
  visual, sin composición interna ni estado.
- **`molecules/`** — composición de 2+ átomos/ui con un propósito reutilizable
  (`FormField`, `Card`, `EmptyState`).
- **`organisms/`** — bloques autónomos de interfaz, posiblemente con estado
  (`Header`, `Footer`, `Modal`).
- **`templates/`** — estructura de página sin contenido (`PageLayout`).

¿Tiene lógica o datos de un feature concreto? → vive en `features/<x>/`, nunca aquí.

## Imports y barrels (§7.2)

- Imports absolutos directos: `import { Header } from '@/packages/design/organisms/header'`.
- **Barrels solo por carpeta hoja**: cada componente propio vive en su carpeta
  con un `index.ts` que re-exporta únicamente ese componente.
- **Prohibido** un `design/index.ts` que agregue carpetas hermanas (causa de los
  8 ciclos del proyecto original). `import-x/no-cycle` lo vigila como error.
- Los componentes de `ui/` son archivos planos (`ui/button.tsx`); se importan
  como `@/packages/design/ui/button`.
