/**
 * Offscreen composition for the downloadable result image, ported from the
 * original `descargarResultado`. The node is built with inline styles and
 * hardcoded hex colors (no CSS variables) so html2canvas always reads them,
 * and with `system-ui` — exactly like the original HTML did.
 *
 * All interpolated values come from the static archetype/capacity constants,
 * so building via `innerHTML` (as the original did) is safe here.
 */
import {
  BLIND_SPOT_BULLET,
  COL,
} from '@/features/profile-test/constants/resultImagePalette'
import type { Archetype, Capacity } from '@/core'

export const RESULT_IMAGE_FILENAME = 'mi-perfil-sabbi.png'

/** Bulleted list markup shared by the strengths and blind-spots columns. */
function bulletList(items: readonly string[], bulletColor: string): string {
  return items
    .map(
      (item) => `
    <div style="font-size:13px;color:${COL.body};line-height:1.55;margin-bottom:7px;padding-left:14px;position:relative;font-family:system-ui,sans-serif">
      <span style="position:absolute;left:0;color:${bulletColor}">•</span>${item}
    </div>`,
    )
    .join('')
}

/**
 * Build the fixed-width (540px) offscreen node to be captured. The caller is
 * responsible for appending it to `document.body` and removing it afterwards.
 */
export function buildResultImageNode(
  archetype: Archetype,
  capacity: Capacity,
): HTMLDivElement {
  const strengths = bulletList(archetype.strengths, COL.verde)
  const blindSpots = bulletList(archetype.blindSpots, BLIND_SPOT_BULLET)

  const wrap = document.createElement('div')
  wrap.style.cssText =
    'position:fixed;left:-9999px;top:0;width:540px;background:#fff;padding:28px;box-sizing:border-box;font-family:system-ui,sans-serif;'
  wrap.innerHTML = `
    <div style="background:${COL.negro};border-radius:18px;padding:26px 28px 24px;margin-bottom:14px">
      <div style="display:inline-block;background:${COL.lima};color:${COL.negro};font-size:10px;font-weight:700;padding:3px 11px;border-radius:6px;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px;font-family:system-ui,sans-serif">${archetype.tier}</div>
      <div style="font-size:28px;font-weight:700;color:${COL.blanco};margin-bottom:9px;line-height:1.2;font-family:system-ui,sans-serif">${archetype.name}</div>
      <div style="font-size:13px;color:${COL.gris};line-height:1.65;font-family:system-ui,sans-serif">${archetype.description}</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
      <div style="border:1.5px solid ${COL.border};border-radius:14px;padding:16px 18px">
        <div style="font-size:10px;font-weight:700;color:${COL.verde};letter-spacing:0.06em;text-transform:uppercase;margin-bottom:10px;font-family:system-ui,sans-serif">Fortalezas</div>
        ${strengths}
      </div>
      <div style="border:1.5px solid ${COL.border};border-radius:14px;padding:16px 18px">
        <div style="font-size:10px;font-weight:700;color:${BLIND_SPOT_BULLET};letter-spacing:0.06em;text-transform:uppercase;margin-bottom:10px;font-family:system-ui,sans-serif">Puntos ciegos</div>
        ${blindSpots}
      </div>
    </div>
    <div style="background:${COL.negro};border-radius:14px;padding:18px 22px;margin-bottom:14px;display:flex;align-items:center;gap:16px">
      <div style="width:46px;height:46px;border-radius:50%;border:2px solid rgba(255,255,255,0.25);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:${COL.blanco};flex-shrink:0;font-family:system-ui,sans-serif">${capacity.id}</div>
      <div>
        <div style="font-size:15px;font-weight:700;color:${COL.blanco};margin-bottom:4px;font-family:system-ui,sans-serif">${capacity.label}</div>
        <div style="font-size:12px;color:${COL.gris};line-height:1.5;font-family:system-ui,sans-serif">${capacity.description}</div>
      </div>
    </div>
    <div style="text-align:center;font-size:11px;color:${COL.gris};font-family:system-ui,sans-serif;letter-spacing:0.05em">sabbi.com</div>
  `
  return wrap
}
