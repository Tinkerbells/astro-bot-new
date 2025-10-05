import { InlineKeyboard, Keyboard } from 'grammy'

import type { Context } from '#root/bot/context.js'

import { City } from '#root/domain/entities/index.js'

export function createLocationRequestKeyboard(ctx: Context) {
  return new Keyboard()
    .requestLocation(ctx.t('onboarding-location-request'))
    .resized()
    .oneTime()
}

export function createBirthTimeKeyboard(ctx: Context) {
  return new InlineKeyboard()
    .text(ctx.t('onboarding-skip'), 'skip_birth_time')
}

export function createCitiesInlineKeyboard() {
  const keyboard = new InlineKeyboard()

  City.popularRussianCities.forEach((city, index) => {
    keyboard.text(city.name, `onboarding:timezone:city:${index}`)
    if ((index + 1) % 2 === 0)
      keyboard.row()
  })

  return keyboard
}
