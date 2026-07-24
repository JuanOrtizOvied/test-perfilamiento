/**
 * Paleta hardcodeada de la imagen descargable del resultado, del mapa `COL` del
 * `descargarResultado` original. Son hex literales a propósito, no tokens CSS:
 * html2canvas necesita leer el color resuelto en el estilo inline.
 */
export const COL = {
  negro: '#223311',
  verde: '#79a82d',
  prof: '#334f1b',
  lima: '#c3ed74',
  body: '#4a5840',
  border: '#e2e1d6',
  hueso: '#f4f4ed',
  blanco: '#ffffff',
  gris: '#afc49a',
} as const

/** Bullet color for blind spots in the image (original hardcoded value). */
export const BLIND_SPOT_BULLET = '#b08a4e'
