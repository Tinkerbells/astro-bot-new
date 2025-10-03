import { InlineKeyboard, Keyboard } from 'grammy'

import type { Context } from '#root/bot/context.js'

import { POPULAR_RUSSIAN_CITIES } from './constants.js'

export function createLocationRequestKeyboard(ctx: Context) {
  return new Keyboard()
    .requestLocation(ctx.t('onboarding-location-request'))
    .resized()
    .oneTime()
}

export function createBirthTimeKeyboard(ctx: Context) {
  return new InlineKeyboard()
    .text(ctx.t('onboarding-skip'), 'onboarding:birth-time:skip')
}

export function createCitiesInlineKeyboard() {
  const keyboard = new InlineKeyboard()

  POPULAR_RUSSIAN_CITIES.forEach((city, index) => {
    keyboard.text(city.city, `onboarding:timezone:city:${index}`)
    if ((index + 1) % 2 === 0)
      keyboard.row()
  })

  return keyboard
}
