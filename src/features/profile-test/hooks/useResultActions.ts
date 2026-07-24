/**
 * Result-view browser actions, ported from `compartir` / `abrirModalCorreo` /
 * `cerrarModalCorreo` / `enviarPorCorreo` / `descargarResultado` plus the
 * transient `dl-msg`. The email modal has no trigger in the original (orphaned
 * modal), so its actions are ported but dormant.
 *
 * The email modal uses the looser `includes('@')` check (quirk 6), distinct from
 * the personal-form regex. The dead `nombre` local from `enviarPorCorreo` (quirk
 * 8) is intentionally not reproduced — it had no effect.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  share as shareCopy,
  emailTemplate,
  messages,
} from '@/features/profile-test/constants/copy'
import { sabbiUrl } from '@/features/profile-test/constants/links'
import { downloadResultImage } from '@/features/profile-test/utils/downloadResultImage'
import type { UseResultActions, UseResultActionsInput } from '@/core'

export function useResultActions({
  archetype,
  capacity,
  firstName,
}: UseResultActionsInput): UseResultActions {
  const [message, setMessage] = useState('')
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [emailInvalid, setEmailInvalid] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
  }, [])

  useEffect(() => clearTimer, [clearTimer])

  /** Show a transient message that clears after `ms` (original timeouts). */
  const flash = useCallback(
    (text: string, ms: number) => {
      setMessage(text)
      clearTimer()
      timerRef.current = setTimeout(() => setMessage(''), ms)
    },
    [clearTimer],
  )

  const share = useCallback(() => {
    const text = shareCopy.text(archetype?.name ?? 'mi perfil')
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator
        .share({ title: shareCopy.title, text, url: sabbiUrl })
        .catch(() => {})
      return
    }
    navigator.clipboard
      ?.writeText(text)
      .then(() => flash(messages.linkCopied, 2500))
      .catch(() => flash(messages.copyThisText(text), 5000))
  }, [archetype, flash])

  const openEmailDialog = useCallback(() => {
    setEmailInvalid(false)
    setEmailDialogOpen(true)
  }, [])

  const closeEmailDialog = useCallback(() => {
    setEmailDialogOpen(false)
  }, [])

  const sendByEmail = useCallback(
    (email: string) => {
      if (!email || !email.includes('@')) {
        setEmailInvalid(true)
        return
      }
      const subject = emailTemplate.subject(archetype?.name ?? '')
      const body = emailTemplate.body({
        name: firstName || undefined,
        archetypeName: archetype?.name ?? '',
        tier: archetype?.tier,
        capacityLabel: capacity?.label ?? '',
        archetypeDescription: archetype?.description ?? '',
      })
      setEmailDialogOpen(false)
      window.open(
        `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
        '_blank',
      )
    },
    [archetype, capacity, firstName],
  )

  const downloadResult = useCallback(() => {
    if (!archetype || !capacity) return
    // "Generando imagen..." persiste hasta success/error (sin auto-clear) —
    // cancela cualquier flash de compartir pendiente primero.
    clearTimer()
    setMessage(messages.generatingImage)
    downloadResultImage(archetype, capacity)
      .then(() => setMessage(''))
      .catch(() => setMessage(messages.downloadError))
  }, [archetype, capacity, clearTimer])

  return {
    message,
    emailDialogOpen,
    emailInvalid,
    share,
    openEmailDialog,
    closeEmailDialog,
    sendByEmail,
    downloadResult,
  }
}
