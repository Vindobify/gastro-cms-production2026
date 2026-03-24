import { z } from 'zod'

/** Erlaubt Ziffern, Leerzeichen, +, Klammern, Schraegstrich und Buchstaben (z. B. Durchwahl-Hinweise). */
const phoneChars = /^[0-9+\s().\-/A-Za-zÄÖÜäöüß]*$/

function hasValidEmailDomain(email: string): boolean {
  const at = email.indexOf('@')
  if (at < 1) return false
  const domain = email.slice(at + 1).toLowerCase()
  if (!domain || domain.startsWith('.') || domain.endsWith('.')) return false
  if (!domain.includes('.')) return false
  const labels = domain.split('.').filter(Boolean)
  if (labels.length < 2) return false
  const tld = labels[labels.length - 1]
  if (!tld || tld.length < 2 || !/^[a-z0-9]+$/i.test(tld)) return false
  return labels.every((label) => label.length > 0 && label.length <= 63)
}

export const reservationFormSchema = z.object({
  name: z.string().trim().min(2, 'Name ist erforderlich'),
  phone: z
    .string()
    .trim()
    .min(5, 'Telefonnummer ist erforderlich')
    .max(120, 'Telefonnummer zu lang')
    .refine((s) => phoneChars.test(s), 'Nur gueltige Zeichen (Ziffern, +, Leerzeichen, Buchstaben, Klammern)'),
  email: z
    .string()
    .trim()
    .email('Gueltige E-Mail erforderlich')
    .refine(hasValidEmailDomain, 'Bitte eine vollstaendige Domain angeben (z. B. name@anbieter.at)'),
  persons: z
    .string()
    .min(1, 'Personenanzahl erforderlich')
    .refine((s) => s === 'mehr' || /^([1-9]|10)$/.test(s), 'Bitte Personenanzahl waehlen'),
  date: z.string().min(1, 'Datum ist erforderlich'),
  time: z.string().min(1, 'Uhrzeit ist erforderlich'),
  message: z.string().optional(),
  datenschutz: z.literal(true, {
    error: 'Bitte stimmen Sie der Datenschutzerklärung zu',
  }),
})

export type ReservationFormData = z.infer<typeof reservationFormSchema>
