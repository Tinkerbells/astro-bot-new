import type { Context } from '#root/bot/context.js'
import type { UserRepositoryDTO } from '#root/data/repositories/user-repository/index.js'

import { userRepository } from '#root/data/repositories/user-repository/index.js'

import { buildBirthDateTimeISO, normalizeBirthDateInput } from './date-utils.js'

type AggregatedStepData = Record<string, unknown>

function collectStepData(stepsData: AggregatedStepData[]): AggregatedStepData {
  return stepsData.reduce<AggregatedStepData>((acc, data) => ({ ...acc, ...data }), {})
}

function formatBirthDateForDisplay(normalizedBirthDate: string): string {
  const [year, month, day] = normalizedBirthDate.split('-')
  return `${day}.${month}.${year}`
}

function normalizeBirthTimeForDisplay(birthTime?: string): string | undefined {
  if (!birthTime)
    return undefined

  const trimmed = birthTime.trim()
  if (!trimmed)
    return undefined

  const [hours, minutes] = trimmed.split(':')
  if (!hours || !minutes)
    return undefined

  const safeHours = hours.padStart(2, '0')
  const safeMinutes = minutes.padStart(2, '0')
  return `${safeHours}:${safeMinutes}`
}

export async function completeOnboarding(ctx: Context): Promise<void> {
  const onboardingState = ctx.session.onboarding
  const aggregatedData = collectStepData(onboardingState.stepsData)

  const birthDateInput = typeof aggregatedData.birthDate === 'string' ? aggregatedData.birthDate : undefined
  const birthTimeInput = typeof aggregatedData.birthTime === 'string' ? aggregatedData.birthTime : undefined
  const birthTimeSkipped = aggregatedData.birthTimeSkipped === true
  const timezone = typeof aggregatedData.timezone === 'string' ? aggregatedData.timezone : undefined
  const city = typeof aggregatedData.city === 'string' ? aggregatedData.city : undefined
  const latitude = typeof aggregatedData.latitude === 'number' ? aggregatedData.latitude : undefined
  const longitude = typeof aggregatedData.longitude === 'number' ? aggregatedData.longitude : undefined

  if (!birthDateInput || !timezone)
    throw new Error('Missing required onboarding data to complete profile')

  const normalizedBirthDate = normalizeBirthDateInput(birthDateInput)
  if (!normalizedBirthDate)
    throw new Error('Unable to normalize birth date provided during onboarding')

  const birthDateTime = buildBirthDateTimeISO(normalizedBirthDate, birthTimeInput, timezone)
  if (!birthDateTime)
    throw new Error('Unable to build birth datetime from onboarding data')

  const userId = ctx.session.user?.id
  if (!userId)
    throw new Error('User identifier is missing in the session state')

  const updatePayload: UserRepositoryDTO.UpdateUserDTO = {
    id: userId,
    birthDateTime,
    timezone,
  }

  const updatedUser = await userRepository.update(updatePayload)

  if (typeof latitude === 'number' && Number.isFinite(latitude))
    updatedUser.latitude = latitude

  if (typeof longitude === 'number' && Number.isFinite(longitude))
    updatedUser.longitude = longitude

  ctx.session.user = updatedUser

  const displayName = updatedUser.firstName
    ?? updatedUser.lastName
    ?? ctx.t('onboarding-field-missing')

  const displayCity = city && city.trim().length > 0
    ? city
    : ctx.t('onboarding-field-missing')

  const displayBirthTime = birthTimeSkipped
    ? ctx.t('onboarding-field-missing')
    : normalizeBirthTimeForDisplay(birthTimeInput) ?? ctx.t('onboarding-field-missing')

  const profileMessage = ctx.t('onboarding-completed', {
    name: displayName,
    birthDate: formatBirthDateForDisplay(normalizedBirthDate),
    birthTime: displayBirthTime,
    timezone,
    city: displayCity,
  })

  await ctx.reply(profileMessage, {
    reply_markup: { remove_keyboard: true },
  })
}
