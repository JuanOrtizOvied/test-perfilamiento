/**
 * Matriz arquetipo × capacidad del documento de contexto
 * (`context-profile/sistema-perfil-sabbi.md`): clasifica cada combinación como
 * típica (✓✓), viable (✓), atípica (◆) o restringida (✗). Las filas siguen el
 * orden C1→C5 en que se lee la tabla; `utils/scoring.ts` solo la consulta.
 */
import type {
  CombinationFit,
  CombinationFitInfo,
  CombinationMatrix,
  CombinationRow,
} from '@/core'

/** Construye una fila C1→C5 en el mismo orden en que se lee la tabla. */
const row = (
  c1: CombinationFit,
  c2: CombinationFit,
  c3: CombinationFit,
  c4: CombinationFit,
  c5: CombinationFit,
): CombinationRow => ({ C1: c1, C2: c2, C3: c3, C4: c4, C5: c5 })

export const COMBINATION_MATRIX: CombinationMatrix = {
  A1: row('tipica', 'tipica', 'viable', 'atipica', 'atipica'),
  A2: row('viable', 'tipica', 'tipica', 'viable', 'atipica'),
  A3: row('atipica', 'viable', 'tipica', 'viable', 'atipica'),
  A4: row('restringida', 'atipica', 'viable', 'tipica', 'viable'),
  A5: row('viable', 'tipica', 'tipica', 'viable', 'atipica'),
  A6: row('atipica', 'viable', 'tipica', 'tipica', 'viable'),
  A7: row('viable', 'tipica', 'tipica', 'viable', 'atipica'),
  A8: row('atipica', 'viable', 'tipica', 'tipica', 'viable'),
  A9: row('restringida', 'atipica', 'viable', 'tipica', 'tipica'),
  A10: row('restringida', 'restringida', 'atipica', 'viable', 'tipica'),
  A11: row('atipica', 'viable', 'viable', 'tipica', 'tipica'),
  A12P: row('viable', 'tipica', 'viable', 'atipica', 'atipica'),
  A12S: row('atipica', 'viable', 'tipica', 'tipica', 'viable'),
}

/** Lectura de cada nivel de encaje, verbatim de la leyenda del documento. */
export const COMBINATION_FIT_INFO: Record<CombinationFit, CombinationFitInfo> =
  {
    tipica: {
      symbol: '✓✓',
      label: 'Típica',
      description: 'El perfil encaja naturalmente con esta capacidad.',
    },
    viable: {
      symbol: '✓',
      label: 'Viable',
      description: 'Requiere matices pero sin contraindicación.',
    },
    atipica: {
      symbol: '◆',
      label: 'Atípica',
      description: 'Requiere revisión del equipo.',
    },
    restringida: {
      symbol: '✗',
      label: 'Restringida',
      description: 'El portafolio se reconstruye por capacidad insuficiente.',
    },
  }
