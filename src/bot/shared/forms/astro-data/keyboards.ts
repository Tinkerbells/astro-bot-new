import { InlineKeyboard, Keyboard } from 'grammy'

import type { Context } from '#root/bot/context.js'

import { City } from '#root/domain/entities/index.js'

/**
 * Создает клавиатуру для запроса геолокации
 */
export function createLocationRequestKeyboard(
  ctx: Context,
  textKey = 'astro-data-location-request',
) {
  return new Keyboard()
    .requestLocation(ctx.t(textKey))
    .resized()
    .oneTime()
}

/**
 * Создает клавиатуру с кнопкой "Пропустить" для времени рождения
 * Используется только для onboarding
 */
export function createBirthTimeSkipKeyboard(
  ctx: Context,
  skipCallbackData: string,
  skipTextKey = 'astro-data-skip',
) {
  return new InlineKeyboard()
    .text(ctx.t(skipTextKey), skipCallbackData)
}

/**
 * Создает inline клавиатуру с популярными российскими городами
 */
export function createCitiesInlineKeyboard(
  callbackDataPrefix = 'astro-data:timezone:city',
) {
  const keyboard = new InlineKeyboard()

  City.popularRussianCities.forEach((city, index) => {
    keyboard.text(city.name, `${callbackDataPrefix}:${index}`)
    if ((index + 1) % 2 === 0)
      keyboard.row()
  })

  return keyboard
}
