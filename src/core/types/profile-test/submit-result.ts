import type { Answers } from './answers'
import type { ResolvedResult, ScoreState } from './scoring'

export interface BuildPayloadInput {
  answers: Answers
  scores: ScoreState
  result: ResolvedResult
}

export interface AnswerColumns {
  nombre: string
  apellido: string
  correo: string
  telefono: string
  objetivo_inversion: string
  horizonte_temporal: string
  experiencia_laboral: string
  tiempo_invirtiendo: string
  nivel_experiencia: string
  tipos_activos: string
  estilo_decision: string
  reaccion_recomendacion: string
  situacion_laboral: string
  tiempo_revision_mensual: string
  tipo_acompanamiento: string
  valor_comunidad: string
  disposicion_riesgo: string
  caida_maxima_tolerable: string
  riesgo_actual: string
  cambio_riesgo_5anos: string
  importancia_flujos: string
  monto_mensual_necesario: string
  rango_edad: string
  hijos_menores_15: string
  hijos_15_24: string
  otras_dependencias: string
  fuente_ingresos: string
  ahorro_mensual: string
  deudas_financieras: string
  propiedades_personales: string
  patrimonio_invertible: string
  postura_peru: string
  como_conocio_sabbi: string
  comodidad_gestion_delegada: string
  experiencia_delegando: string
}

export interface ResultPayload extends AnswerColumns {
  timestamp: string
  arquetipo: string
  arquetipo_nombre: string
  arquetipo_tier: string
  arquetipo_desc: string
  fortaleza_1: string
  fortaleza_2: string
  punto_ciego_1: string
  punto_ciego_2: string
  portafolio_texto: string
  capacidad: string
  E_score: number
  I_score: number
  R_score: number
  F_score: number
  CAP_score: number
  COLAB: number
  CONF: number
}
