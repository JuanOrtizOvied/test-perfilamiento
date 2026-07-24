/**
 * Sabbi services recommended by tier. Data only (serializable) — copied verbatim
 * from the original HTML `SERVICIOS`. Icons are NOT stored here: the original
 * inline SVGs were lucide glyphs, so ServiceCard maps `id` → a lucide icon.
 *
 * `iconUrl` / `iconAlt` are optional slots for future custom brand icons served
 * as assets; they are not required today.
 */

import type { Service } from '@/core'

export const SERVICES: readonly Service[] = [
  {
    id: 'circulo',
    name: 'Círculo Sabbi',
    tag: 'Comunidad de inversión',
    description:
      'Accede a análisis, debates y decisiones colectivas junto a inversionistas de tu nivel. Aprende de la experiencia del grupo y fortalece tu criterio.',
    tiers: ['Líderes', 'Colaboradores'],
    highlight: true,
    color: '#334f1b',
    cta: 'Conocer el Círculo',
    url: 'https://sabbi.com',
  },
  {
    id: 'foro',
    name: 'Foro de Cracks',
    tag: 'Solo para Líderes',
    description:
      'Espacio exclusivo para inversionistas con alto nivel de experiencia y criterio. Debates profundos, ideas avanzadas y acceso a oportunidades de alto perfil.',
    tiers: ['Líderes'],
    highlight: true,
    color: '#223311',
    cta: 'Quiero acceder',
    url: 'https://sabbi.com',
  },
  {
    id: 'asesoria',
    name: 'Asesoría Patrimonial',
    tag: 'Gestión personalizada',
    description:
      'Trabaja con un asesor Sabbi para diseñar y estructurar tu portafolio de acuerdo a tu perfil, objetivos y capacidad financiera.',
    tiers: ['Líderes', 'Colaboradores', 'Seguidores'],
    highlight: false,
    color: '#7562c6',
    cta: 'Agendar una llamada',
    url: 'https://sabbi.com',
  },
  {
    id: 'productos',
    name: 'Productos de Inversión',
    tag: 'Asset Management',
    description:
      'Accede a los vehículos de inversión curados por Sabbi: mercados públicos, inmobiliario directo, mercados privados y Club Deals.',
    tiers: ['Líderes', 'Colaboradores', 'Seguidores'],
    highlight: false,
    color: '#048a81',
    cta: 'Ver productos',
    url: 'https://sabbi.com',
  },
] as const
