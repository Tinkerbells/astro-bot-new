import type { Context } from '#root/bot/context.js'

/**
 * Результат сбора астрологических данных
 */
export type AstroDataResult = {
  birthDate: string
  birthTime: string // Всегда обязательно для астро-данных
  birthTimeUTC: string
  city?: string
  timezone: string
  latitude: number
  longitude: number
}

/**
 * Результат сбора данных для onboarding (birthTime опционально)
 */
export type OnboardingAstroDataResult = {
  birthDate: string
  birthTime: string | null // null если пользователь пропустил
  birthTimeUTC: string | null // null если пользователь пропустил
  city?: string
  timezone: string
  latitude: number
  longitude: number
}

/**
 * Callback вызываемый после успешного сбора астро-данных
 */
export type AstroDataCallback = (
  ctx: Context,
  data: AstroDataResult,
) => Promise<void>

/**
 * Callback для onboarding (birthTime опционально)
 */
export type OnboardingAstroDataCallback = (
  ctx: Context,
  data: OnboardingAstroDataResult,
) => Promise<void>

/**
 * Опции для conversation сбора астро-данных
 */
export type AstroDataOptions = {
  callback: AstroDataCallback
  maxCityAttempts?: number
}

/**
 * Опции для onboarding conversation
 */
export type OnboardingAstroDataOptions = {
  callback: OnboardingAstroDataCallback
  allowSkipBirthTime: true
  maxCityAttempts?: number
}

/**
 * Данные о месте рождения
 */
export type BirthPlaceData = {
  city?: string
  timezone: string
  latitude: number
  longitude: number
}
