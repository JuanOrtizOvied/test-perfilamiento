/**
 * Section → question-key contract for the progress snapshots. Declarative table
 * (iterated, not a chain of ifs): each section maps to its ordered questions, y
 * cada pregunta lleva la clave en inglés bajo la que se serializa. `Q0_ap` es el
 * apellido capturado dentro del formulario personal (no tiene Question propia),
 * resuelto por el fallback de `answerText`.
 *
 * Es el contrato de cable con el backend — mantener en sync con `questions.ts`.
 * `api/submitProgress.ts` solo lo itera.
 */
import type { ProgressSection } from '@/core'

export const PROGRESS_SCHEMA: readonly ProgressSection[] = [
  {
    key: 'personal',
    commitGate: 'Q02',
    questions: [
      { id: 'Q0', key: 'name' },
      { id: 'Q0_ap', key: 'lastName' },
      { id: 'Q01', key: 'email' },
      { id: 'Q02', key: 'phone' },
    ],
  },
  {
    key: 'objective',
    questions: [
      { id: 'Q1', key: 'investmentGoal' },
      { id: 'Q2', key: 'timeHorizon' },
    ],
  },
  {
    key: 'experience',
    questions: [
      { id: 'Q3', key: 'financeBackground' },
      { id: 'Q4', key: 'investingSince' },
      { id: 'Q5', key: 'experienceLevel' },
      { id: 'Q6', key: 'assetTypes' },
    ],
  },
  {
    key: 'involvement',
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
    questions: [
      { id: 'Q13', key: 'riskDisposition' },
      { id: 'Q14', key: 'maxTolerableDrop' },
      { id: 'Q15', key: 'currentRisk' },
      { id: 'Q16', key: 'riskChange5y' },
    ],
  },
  {
    key: 'incomeFlows',
    questions: [
      { id: 'Q17', key: 'incomeImportance' },
      { id: 'Q18', key: 'monthlyIncomeNeeded' },
    ],
  },
  {
    key: 'financialCapacity',
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
    questions: [{ id: 'Q28', key: 'peruStance' }],
  },
  {
    key: 'trust',
    questions: [
      { id: 'Q29', key: 'howFoundSabbi' },
      { id: 'Q30', key: 'delegationComfort' },
      { id: 'Q31', key: 'delegationExperience' },
    ],
  },
]
