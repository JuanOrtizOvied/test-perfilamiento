/**
 * Atributos por arquetipo de la tabla de tiers del documento de contexto
 * (`context-profile/sistema-perfil-sabbi.md`), verbatim: expertise,
 * involucramiento al invertir, tolerancia al riesgo, colaboratividad
 * comunitaria y flujos. Complementa el texto de `constants/archetypes.ts` sin
 * tocarlo.
 */
import type { ArchetypeAttributes, ArchetypeId } from '@/core'

export const ARCHETYPE_ATTRIBUTES: Readonly<
  Record<ArchetypeId, ArchetypeAttributes>
> = {
  A1: {
    expertise: 'Bajo',
    involvement: 'Bajo',
    riskTolerance: 'Conservador',
    collaboration: 'Indiferente',
    flows: 'Alto',
  },
  A2: {
    expertise: 'Bajo',
    involvement: 'Bajo',
    riskTolerance: 'Moderado',
    collaboration: 'Indiferente',
    flows: 'Variable',
  },
  A3: {
    expertise: 'Bajo',
    involvement: 'Alto',
    riskTolerance: 'Moderado',
    collaboration: 'Alto',
    flows: 'Variable',
  },
  A4: {
    expertise: 'Medio',
    involvement: 'Alto',
    riskTolerance: 'Dinámico',
    collaboration: 'Alto',
    flows: 'Variable',
  },
  A5: {
    expertise: 'Medio',
    involvement: 'Bajo',
    riskTolerance: 'Moderado',
    collaboration: 'Medio',
    flows: 'Variable',
  },
  A6: {
    expertise: 'Medio | Alto',
    involvement: 'Alto',
    riskTolerance: 'Moderado',
    collaboration: 'Alto',
    flows: 'Bajo',
  },
  A7: {
    expertise: 'Medio | Alto',
    involvement: 'Alto',
    riskTolerance: 'Moderado',
    collaboration: 'Alto',
    flows: 'Alto',
  },
  A8: {
    expertise: 'Experto',
    involvement: 'Medio',
    riskTolerance: 'Moderado',
    collaboration: 'Media/Alta',
    flows: 'Variable',
  },
  A9: {
    expertise: 'Experto',
    involvement: 'Medio',
    riskTolerance: 'Dinámico',
    collaboration: 'Medio',
    flows: 'Variable',
  },
  A10: {
    expertise: 'Experto',
    involvement: 'Alto',
    riskTolerance: 'Audaz',
    collaboration: 'Alto',
    flows: 'Bajo',
  },
  A11: {
    expertise: 'Experto',
    involvement: 'Alto',
    riskTolerance: 'Dinámico',
    collaboration: 'Máximo',
    flows: 'Variable',
  },
  A12P: {
    expertise: 'Bajo | Medio',
    involvement: 'Medio',
    riskTolerance: 'Variable',
    collaboration: 'Muy bajo',
    flows: 'Variable',
  },
  A12S: {
    expertise: 'Alto',
    involvement: 'Alto',
    riskTolerance: 'Variable',
    collaboration: 'Muy bajo',
    flows: 'Variable',
  },
}
