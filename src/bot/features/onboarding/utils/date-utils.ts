import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'

dayjs.extend(customParseFormat)

const BIRTH_DATE_INPUT_FORMATS = ['DD.MM.YYYY', 'DD-MM-YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']
const ISO_DATE_FORMAT = 'YYYY-MM-DD'

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
