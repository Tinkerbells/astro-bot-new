import { Keyboard } from 'grammy'

import type { Context } from '#root/bot/context.js'

import { getCitiesKeyboard } from './utils/index.js'

export function createLocationRequestKeyboard(ctx: Context) {
  return new Keyboard()
    .requestLocation(ctx.t('onboarding-location-request'))
    .resized()
    .oneTime()
}

export function createCitiesKeyboard(ctx: Context) {
  const cities = getCitiesKeyboard()
  const keyboard = new Keyboard()

  cities.forEach((city, index) => {
    keyboard.text(city)
    if ((index + 1) % 2 === 0) {
      keyboard.row()
    }
  })

  keyboard.row()
    .requestLocation(ctx.t('onboarding-location-request'))

  keyboard.row()
    .text(ctx.t('onboarding-location-custom'))

  return keyboard
    .resized()
    .oneTime()
}
