// html2canvas-pro: fork drop-in de html2canvas (misma API/opciones) que parsea
// los colores oklch() de los tokens de Tailwind v4 — 1.4.1 revienta con ellos.
import { html2canvas } from 'html2canvas-pro'
import {
  buildResultImageNode,
  RESULT_IMAGE_FILENAME,
} from '@/features/profile-test/utils/resultImage'
import type { Archetype, Capacity } from '@/core'

/**
 * Renderiza el nodo offscreen del resultado y lo descarga como PNG. Resuelve al
 * completar; rechaza si la captura falla (el caller decide qué mensaje mostrar).
 */
export async function downloadResultImage(
  archetype: Archetype,
  capacity: Capacity,
): Promise<void> {
  const wrap = buildResultImageNode(archetype, capacity)
  document.body.appendChild(wrap)
  try {
    // El original espera 150ms para que el nodo offscreen tenga layout antes de capturar.
    await new Promise((resolve) => setTimeout(resolve, 150))
    const canvas = await html2canvas(wrap, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: false,
      allowTaint: true,
      logging: false,
      removeContainer: true,
    })
    const link = document.createElement('a')
    link.download = RESULT_IMAGE_FILENAME
    link.href = canvas.toDataURL('image/png')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } finally {
    if (document.body.contains(wrap)) document.body.removeChild(wrap)
  }
}
