/**
 * External URLs and brand assets used by the Test Perfil Sabbi.
 * URLs are copied verbatim from the original standalone HTML.
 */
import sabbiLogo from '@assets/sabbi-logo.svg'

/**
 * Brand logo shown in the test header — the SVG embedded inline in the original
 * HTML (`.sabbi-logo`), extracted to a local asset so the header does not
 * depend on the network.
 */
export const logoUrl = sabbiLogo
export const logoAlt = 'Sabbi'

/** "Ver miembros como yo" → Círculo Sabbi community (Circle). */
export const circleMembersUrl =
  'https://circulo-sabbi.circle.so/s/perfil-sabbi/'

/** "Agendar llamada con asesor" → WhatsApp (query string preserved verbatim). */
export const whatsappAdvisorUrl =
  'https://api.whatsapp.com/send/?phone=51981108052&text=%C2%A1Hola%2C+Sabbi%21+Quiero+saber+más+de+la+asesoría+de+inversión'

/** Public site + share fallback target. */
export const sabbiUrl = 'https://sabbi.com'

/** Contact address shown when no service matches the user's tier. */
export const sabbiEmail = 'hola@sabbi.com'
