export function buildBirthDateTimeISO(
  birthDateInput?: string,
  birthTime?: string,
  timezone?: string,
): string | undefined {
  if (!birthDateInput || !timezone)
    return undefined

  const [year, month, day] = birthDateInput.split('-').map(part => Number.parseInt(part, 10))
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day))
    return undefined

  const [hour, minute] = (birthTime ?? '00:00').split(':').map(part => Number.parseInt(part, 10))
  const safeHour = Number.isFinite(hour) ? hour : 0
  const safeMinute = Number.isFinite(minute) ? minute : 0

  const utcDate = new Date(Date.UTC(year, month - 1, day, safeHour, safeMinute, 0))
  const offsetMinutes = calculateTimezoneOffset(utcDate, timezone)

  const sign = offsetMinutes >= 0 ? '+' : '-'
  const absoluteOffset = Math.abs(offsetMinutes)
  const offsetHours = Math.floor(absoluteOffset / 60)
  const offsetRemainingMinutes = absoluteOffset % 60

  const hourString = String(safeHour).padStart(2, '0')
  const minuteString = String(safeMinute).padStart(2, '0')
  const offsetString = `${sign}${String(offsetHours).padStart(2, '0')}:${String(offsetRemainingMinutes).padStart(2, '0')}`

  return `${birthDateInput}T${hourString}:${minuteString}:00${offsetString}`
}

export function normalizeBirthDateInput(birthDate: string): string | undefined {
  if (!birthDate)
    return undefined

  const trimmed = birthDate.trim()
  if (!trimmed)
    return undefined

  const cleaned = trimmed.replace(/[./_]/g, '-').replace(/\s+/g, '')
  const parts = cleaned.split('-').filter(Boolean)

  if (parts.length !== 3)
    return undefined

  // If already in ISO (YYYY-MM-DD)
  if (parts[0].length === 4) {
    const [year, month, day] = parts
    return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-')
  }

  const [dayRaw, monthRaw, yearRaw] = parts
  const day = Number.parseInt(dayRaw, 10)
  const month = Number.parseInt(monthRaw, 10)
  const year = Number.parseInt(yearRaw, 10)

  if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year))
    return undefined

  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function calculateTimezoneOffset(date: Date, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })

  const parts = formatter.formatToParts(date)
  const values: Record<string, string> = {}

  for (const part of parts) {
    if (part.type !== 'literal')
      values[part.type] = part.value
  }

  const asUTC = Date.UTC(
    Number.parseInt(values.year, 10),
    Number.parseInt(values.month, 10) - 1,
    Number.parseInt(values.day, 10),
    Number.parseInt(values.hour, 10),
    Number.parseInt(values.minute, 10),
    Number.parseInt(values.second, 10),
  )

  return (asUTC - date.getTime()) / 60000
}

export function isValidTimeZone(timezone?: string): boolean {
  if (!timezone)
    return false

  try {
    const formatter = new Intl.DateTimeFormat('en-US', { timeZone: timezone })
    formatter.format(new Date())
    return true
  }
  catch {
    return false
  }
}
