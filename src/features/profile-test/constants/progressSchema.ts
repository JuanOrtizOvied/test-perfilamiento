/**
 * Section → question-key contract for the progress snapshots. Declarative table
 * (iterated, not a chain of ifs): each section maps to its ordered questions, y
 * cada pregunta lleva la clave en inglés bajo la que se serializa. `Q0_ap` es el
 * apellido capturado dentro del formulario personal (no tiene Question propia),
 * resuelto por el fallback de `answerText`.
 *
 * `title` es el nombre visible de la sección; coincide con el `bloque` de sus
 * preguntas en `questions.ts` y se declara aquí porque `Q0_ap` no tiene Question
 * de donde leerlo.
 *
 * Es el contrato de cable con el backend — mantener en sync con `questions.ts`.
 * `api/submitProgress.ts` solo lo itera.
 */
import type { ProgressSection } from '@/core'

export const PROGRESS_SCHEMA: readonly ProgressSection[] = [
  {
    key: 'personal',
    title: 'Datos personales',
    commitGate: 'Q02',
    plainFields: true,
    questions: [
      { id: 'Q0', key: 'name' },
      { id: 'Q0_ap', key: 'lastName' },
      { id: 'Q01', key: 'email' },
      { id: 'Q02', key: 'phone' },
    ],
  },
  {
    key: 'objective',
    title: 'Objetivo de inversión',
    questions: [
      { id: 'Q1', key: 'investmentGoal' },
      { id: 'Q2', key: 'timeHorizon' },
    ],
  },
  {
    key: 'experience',
    title: 'Experiencia',
    questions: [
      { id: 'Q3', key: 'financeBackground' },
      { id: 'Q4', key: 'investingSince' },
      { id: 'Q5', key: 'experienceLevel' },
      { id: 'Q6', key: 'assetTypes' },
    ],
  },
  {
    key: 'involvement',
    title: 'Involucramiento',
    questions: [
      { id: 'Q7', key: 'decisionStyle' },
      { id: 'Q8', key: 'recommendationReaction' },
      { id: 'Q9', key: 'workSituation' },
      { id: 'Q10', key: 'monthlyReviewTime' },
      { id: 'Q11', key: 'supportType' },
      { id: 'Q12', key: 'communityValue' },
    ],
  },
  {
    key: 'risk',
    title: 'Riesgo',
    questions: [
      { id: 'Q13', key: 'riskDisposition' },
      { id: 'Q14', key: 'maxTolerableDrop' },
      { id: 'Q15', key: 'currentRisk' },
      { id: 'Q16', key: 'riskChange5y' },
    ],
  },
  {
    key: 'incomeFlows',
    title: 'Flujos',
    questions: [
      { id: 'Q17', key: 'incomeImportance' },
      { id: 'Q18', key: 'monthlyIncomeNeeded' },
    ],
  },
  {
    key: 'financialCapacity',
    title: 'Capacidad financiera',
    questions: [
      { id: 'Q19', key: 'ageRange' },
      { id: 'Q20', key: 'childrenUnder15' },
      { id: 'Q21', key: 'children15to24' },
      { id: 'Q22', key: 'otherDependents' },
      { id: 'Q23', key: 'otherIncomeSource' },
      { id: 'Q24', key: 'monthlySavings' },
      { id: 'Q25', key: 'financialDebt' },
      { id: 'Q26', key: 'personalProperty' },
      { id: 'Q27', key: 'investableWealth' },
    ],
  },
  {
    key: 'peruContext',
    title: 'Contexto Perú',
    questions: [{ id: 'Q28', key: 'peruStance' }],
  },
  {
    key: 'trust',
    title: 'Confianza',
    questions: [
      { id: 'Q29', key: 'howFoundSabbi' },
      { id: 'Q30', key: 'delegationComfort' },
      { id: 'Q31', key: 'delegationExperience' },
    ],
  },
]
