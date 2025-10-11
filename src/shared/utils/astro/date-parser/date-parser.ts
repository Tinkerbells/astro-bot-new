import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'

dayjs.extend(customParseFormat)

const BIRTH_DATE_INPUT_FORMATS = ['DD.MM.YYYY', 'DD-MM-YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']
const ISO_DATE_FORMAT = 'YYYY-MM-DD'

/**
 * Парсит дату рождения из различных форматов в ISO формат
 *
 * Поддерживаемые форматы ввода:
 * - DD.MM.YYYY (15.06.1990)
 * - DD-MM-YYYY (15-06-1990)
 * - DD/MM/YYYY (15/06/1990)
 * - YYYY-MM-DD (1990-06-15) - уже в ISO формате
 *
 * @param birthDate - Дата в одном из поддерживаемых форматов
 * @returns Дата в формате ISO (YYYY-MM-DD) или undefined если формат неверный
 *
 * @example
 * ```ts
 * parseBirthDateInput('15.06.1990')  // '1990-06-15'
 * parseBirthDateInput('15-06-1990')  // '1990-06-15'
 * parseBirthDateInput('1990-06-15')  // '1990-06-15'
 * parseBirthDateInput('invalid')     // undefined
 * parseBirthDateInput('')            // undefined
 * ```
 */
export function parseBirthDateInput(birthDate: string): string | undefined {
  if (!birthDate)
    return undefined

  const trimmed = birthDate.trim()
  if (!trimmed)
    return undefined

  for (const format of BIRTH_DATE_INPUT_FORMATS) {
    const parsed = dayjs(trimmed, format, true)
    if (parsed.isValid())
      return parsed.format(ISO_DATE_FORMAT)
  }

  return undefined
}
