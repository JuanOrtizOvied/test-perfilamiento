import { useEffect, useRef } from 'react'
import { Chip } from '@/packages/design/atoms/chip'
import { ProgressBar } from '@/packages/design/atoms/progress-bar'
import { TestLayout } from '@/packages/design/templates/test-layout'
import { WelcomeCard } from '@/features/profile-test/organisms/WelcomeCard'
import { PersonalDataForm } from '@/features/profile-test/organisms/PersonalDataForm'
import { QuestionCard } from '@/features/profile-test/organisms/QuestionCard'
import { IntermissionCard } from '@/features/profile-test/organisms/IntermissionCard'
import { ResultCard } from '@/features/profile-test/organisms/ResultCard'
import { RecommendationsPanel } from '@/features/profile-test/organisms/RecommendationsPanel'
import { SendEmailDialog } from '@/features/profile-test/organisms/SendEmailDialog'
import { useProfileTest } from '@/features/profile-test/hooks/useProfileTest'
import { useResultActions } from '@/features/profile-test/hooks/useResultActions'
import useRegisterSabbiTestQuestion from '@/features/profile-test/hooks/useRegisterSabbiTestQuestion'
import { buildProgressPayload } from '@/features/profile-test/api/submitProgress'
import {
  header,
  progress as progressCopy,
} from '@/features/profile-test/constants/copy'
import {
  logoAlt,
  logoUrl,
  circleMembersUrl,
  whatsappAdvisorUrl,
} from '@/features/profile-test/constants/links'
import { DEFAULT_COUNTRY_CODE } from '@/features/profile-test/constants/questions'
import { ARCHETYPES } from '@/features/profile-test/constants/archetypes'
import { CAPACITIES } from '@/features/profile-test/constants/capacities'
import { SERVICES } from '@/features/profile-test/constants/services'
import type { AnswerValue, ProgressPayload, RecallSegment } from '@/core'

/**
 * Content identity of a progress snapshot — the answered sections plus the
 * status, excluding the always-changing `updatedAt`. Two snapshots with the
 * same signature carry the same answers, so there is nothing new to register.
 */
function progressSignature(payload: ProgressPayload): string {
  return `${payload.status}|${JSON.stringify(payload.sections)}`
}

function asString(value: AnswerValue | undefined): string {
  return typeof value === 'string' ? value : ''
}

function renderRecall(segments: RecallSegment[] | null) {
  if (!segments) return undefined
  return (
    <p className="mx-auto mb-0 max-w-[460px]">
      {segments.map((segment, index) => {
        if (segment.chip)
          return (
            <Chip key={index} variant="recall">
              {segment.text}
            </Chip>
          )
        if (segment.emphasis === 'em')
          return <em key={index}>{segment.text}</em>
        return <span key={index}>{segment.text}</span>
      })}
    </p>
  )
}

/**
 * Test Perfil Sabbi composition root. Wires `useProfileTest` (flow) and
 * `useResultActions` (browser actions), switches the current view, and derives
 * presentational props via the feature utils/constants. No business rules live
 * here.
 */
export function ProfileTestPage() {
  const {
    state,
    view,
    question,
    progress,
    intermission,
    recall,
    hasSavedProgress,
    actions,
  } = useProfileTest()

  // El hook también expone `loading` y `errorMessage` (mismo contrato que el
  // resto de la capa), pero aquí el registro es una sincronización de fondo: no
  // hay botón que deshabilitar ni error que mostrarle al usuario, porque el
  // siguiente snapshot hace upsert y sana lo que falle.
  const { registerSabbiTestQuestion } = useRegisterSabbiTestQuestion()

  /**
   * Última firma registrada, junto al `sessionId` al que pertenece. Al reiniciar
   * el test cambia el `sessionId` (`RESTART` reconstruye el estado inicial), así
   * que la firma queda invalidada sola y la corrida nueva vuelve a registrar.
   */
  const lastRegisteredRef = useRef<{ sessionId: string; signature: string }>({
    sessionId: '',
    signature: '',
  })

  // Registra un snapshot cada vez que cambia el contenido contestado — o sea,
  // una vez por pregunta. La guardia de firma evita repetir al pasar por un
  // intermedio o al retroceder (no cambia el contenido), pero sí registra si el
  // usuario edita una respuesta anterior. Cada envío hace upsert de la misma
  // fila por `sessionId`.
  useEffect(() => {
    // Las de selección múltiple se retienen mientras el usuario sigue marcando
    // y desmarcando: se registran de una sola vez al pulsar Continuar, cuando la
    // vista deja de ser esa pregunta. Las de selección única no lo necesitan,
    // porque avanzan solas al elegir.
    if (view === 'question' && question.tipo === 'multi') return

    const payload = buildProgressPayload(state)
    const nothingToSend =
      !state.result && Object.keys(payload.sections).length === 0
    if (nothingToSend) return

    const signature = progressSignature(payload)
    const last = lastRegisteredRef.current
    if (last.sessionId === state.sessionId && last.signature === signature)
      return

    lastRegisteredRef.current = { sessionId: state.sessionId, signature }
    void registerSabbiTestQuestion({ payload })
  }, [state, view, question, registerSabbiTestQuestion])

  const archetype = state.lastArq ? (ARCHETYPES[state.lastArq] ?? null) : null
  const capacity = state.lastCap ? (CAPACITIES[state.lastCap] ?? null) : null

  const resultActions = useResultActions({
    archetype,
    capacity,
    firstName: state.firstName,
  })

  const progressNode = progress ? (
    <div>
      <div className="mb-1.5 flex justify-between text-[11px] font-semibold tracking-[0.03em] text-[#6b7a5a]">
        <span>{progressCopy.stepLabel(progress.current, progress.total)}</span>
        <span>{progress.percent}%</span>
      </div>
      <ProgressBar value={progress.percent} />
    </div>
  ) : undefined

  const answer = state.resp[question.id]
  const fieldError =
    state.error?.scope === 'field'
      ? {
          field: state.error.field,
          message: state.error.message,
          nonce: state.error.nonce,
        }
      : undefined

  function renderView() {
    switch (view) {
      case 'welcome':
        return (
          <WelcomeCard
            onStart={actions.start}
            showResume={hasSavedProgress}
            onResume={actions.resume}
          />
        )

      case 'personal':
        return (
          <PersonalDataForm
            bloque={question.bloque}
            texto={question.texto}
            values={{
              name: asString(state.resp['Q0']),
              lastName: asString(state.resp['Q0_ap']),
              email: asString(state.resp['Q01']),
              countryCode:
                asString(state.resp['Q02_cc']) || DEFAULT_COUNTRY_CODE,
              phone: asString(state.resp['Q02_num']),
            }}
            error={fieldError}
            onFieldChange={actions.setPersonalField}
            onNext={actions.next}
            onBack={actions.back}
          />
        )

      case 'question':
        return (
          <QuestionCard
            question={question}
            selectedIndex={typeof answer === 'number' ? answer : undefined}
            selectedIndices={Array.isArray(answer) ? answer : []}
            value={asString(answer)}
            error={state.error ?? undefined}
            onSelect={
              question.tipo === 'multi' ? actions.pickMulti : actions.pickSingle
            }
            onChange={actions.setTextField}
            onNext={actions.next}
            onBack={actions.back}
          />
        )

      case 'intermission':
        if (!intermission) return null
        return (
          <IntermissionCard
            intermission={
              intermission.appendsName && state.firstName
                ? {
                    ...intermission,
                    title: `${intermission.title}, ${state.firstName}`,
                  }
                : intermission
            }
            recall={renderRecall(recall)}
            onContinue={actions.dismissIntermission}
          />
        )

      case 'result':
        if (!archetype || !capacity) return null
        return (
          <ResultCard
            archetype={archetype}
            capacity={capacity}
            message={resultActions.message}
            actions={{
              onRestart: actions.restart,
              onMembers: () => window.open(circleMembersUrl, '_blank'),
              onDownload: resultActions.downloadResult,
              onScheduleCall: () => window.open(whatsappAdvisorUrl, '_blank'),
              onShare: resultActions.share,
            }}
            onShowRecommendations={actions.showRecommendations}
          />
        )

      case 'recommendations':
        if (!archetype) return null
        return (
          <RecommendationsPanel
            tier={archetype.tier}
            archetypeName={archetype.name}
            services={SERVICES.filter((service) =>
              service.tiers.includes(archetype.tier),
            )}
            onBack={actions.back}
          />
        )

      default:
        return null
    }
  }

  return (
    <TestLayout
      logoUrl={logoUrl}
      logoAlt={logoAlt}
      subtitle={header.subtitle}
      progress={progressNode}
    >
      {renderView()}
      <SendEmailDialog
        open={resultActions.emailDialogOpen}
        onOpenChange={(open) =>
          open
            ? resultActions.openEmailDialog()
            : resultActions.closeEmailDialog()
        }
        defaultEmail={asString(state.resp['Q01'])}
        invalid={resultActions.emailInvalid}
        onSend={resultActions.sendByEmail}
        onCancel={resultActions.closeEmailDialog}
      />
    </TestLayout>
  )
}
