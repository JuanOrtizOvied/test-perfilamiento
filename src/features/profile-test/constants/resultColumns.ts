import type { AnswerColumns } from '@/core'

/**
 * Columna del payload → id de pregunta. Nombres de columna verbatim del sheet
 * original (español); NO renombrar sin coordinar con el consumidor externo.
 * `Record<keyof AnswerColumns, ...>` obliga a mapear todas las columnas.
 */
export const ANSWER_COLUMN_QUESTIONS: Record<keyof AnswerColumns, string> = {
  nombre: 'Q0',
  apellido: 'Q0_ap',
  correo: 'Q01',
  telefono: 'Q02',
  objetivo_inversion: 'Q1',
  horizonte_temporal: 'Q2',
  experiencia_laboral: 'Q3',
  tiempo_invirtiendo: 'Q4',
  nivel_experiencia: 'Q5',
  tipos_activos: 'Q6',
  estilo_decision: 'Q7',
  reaccion_recomendacion: 'Q8',
  situacion_laboral: 'Q9',
  tiempo_revision_mensual: 'Q10',
  tipo_acompanamiento: 'Q11',
  valor_comunidad: 'Q12',
  disposicion_riesgo: 'Q13',
  caida_maxima_tolerable: 'Q14',
  riesgo_actual: 'Q15',
  cambio_riesgo_5anos: 'Q16',
  importancia_flujos: 'Q17',
  monto_mensual_necesario: 'Q18',
  rango_edad: 'Q19',
  hijos_menores_15: 'Q20',
  hijos_15_24: 'Q21',
  otras_dependencias: 'Q22',
  fuente_ingresos: 'Q23',
  ahorro_mensual: 'Q24',
  deudas_financieras: 'Q25',
  propiedades_personales: 'Q26',
  patrimonio_invertible: 'Q27',
  postura_peru: 'Q28',
  como_conocio_sabbi: 'Q29',
  comodidad_gestion_delegada: 'Q30',
  experiencia_delegando: 'Q31',
}
