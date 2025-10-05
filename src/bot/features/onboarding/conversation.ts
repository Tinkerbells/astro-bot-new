import type { Conversation } from '@grammyjs/conversations'

import type { Context } from '#root/bot/context.js'

import { safe } from '#root/shared/safe/index.js'
import { User } from '#root/domain/entities/user/user.js'
import { updateSessionUser } from '#root/bot/shared/helpers/user.js'
import { cityService } from '#root/bot/services/city-service/index.js'
import { OnboardingStatus } from '#root/application/onboarding-service/index.js'
import { userRepository } from '#root/data/repositories/user-repository/index.js'

import { findCityByText } from './utils/city-utils.js'
import { BirthDateStep } from './steps/birth-date-step.js'
import { BirthTimeStep } from './steps/birth-time-step.js'
import { parseCoordinates } from './utils/coordinates-utils.js'
import { getTimezoneByCoordinates, isValidTimezone } from './utils/timezone-utils.js'
import { createBirthTimeKeyboard, createCitiesInlineKeyboard, createLocationRequestKeyboard } from './keyboards.js'

export const ONBOARDING_CONVERSATION = 'onboarding'

export async function onboarding(
  conversation: Conversation<Context, Context>,
  ctx: Context,
) {
  // Обновляем статус онбординга в сессии через conversation.external
  await conversation.external((externalCtx) => {
    externalCtx.session.onboarding.status = OnboardingStatus.InProgress
  })

  // Приветственное сообщение
  await ctx.reply(ctx.t('onboarding-start'))

  // === Шаг 1: Дата рождения ===
  await ctx.reply(ctx.t('onboarding-birth-date'))

  const birthDate = await conversation.form.build(BirthDateStep.toFormBuilder())

  // === Шаг 2: Время рождения ===
  await ctx.reply(ctx.t('onboarding-birth-time'), {
    reply_markup: createBirthTimeKeyboard(ctx),
  })

  let birthTime: string | null = null

  // Ожидаем либо текст, либо callback от кнопки "Пропустить"
  const birthTimeCtx = await conversation.wait()

  if (birthTimeCtx.callbackQuery?.data === 'skip_birth_time') {
    await birthTimeCtx.answerCallbackQuery()
    await birthTimeCtx.reply(ctx.t('onboarding-birth-time-skipped'), {
      reply_markup: { remove_keyboard: true },
    })
    birthTime = null
  }
  else if (birthTimeCtx.message?.text) {
    // Используем FormBuilder из BirthTimeStep
    const builder = BirthTimeStep.toFormBuilder()
    const result = await builder.validate(birthTimeCtx)

    if (result.ok) {
      birthTime = result.value
      await birthTimeCtx.reply(ctx.t('onboarding-birth-time-received'))
    }
    else {
      await birthTimeCtx.reply(ctx.t('onboarding-birth-time-invalid'))
      // Возвращаемся к началу шага времени
      await conversation.skip({ next: true })
    }
  }
  else {
    await birthTimeCtx.reply(ctx.t('onboarding-birth-time-invalid'))
    await conversation.skip({ next: true })
  }

  // === Шаг 3: Локация и часовой пояс ===
  await ctx.reply(ctx.t('onboarding-location'), {
    reply_markup: createCitiesInlineKeyboard(),
  })

  await ctx.reply(ctx.t('onboarding-location-share'), {
    reply_markup: createLocationRequestKeyboard(ctx),
  })

  let city: string | undefined
  let timezone: string
  let latitude: number | undefined
  let longitude: number | undefined

  const locationCtx = await conversation.wait()

  // Обработка геолокации
  if (locationCtx.message?.location) {
    const location = locationCtx.message.location
    latitude = location.latitude
    longitude = location.longitude

    // Получаем timezone через conversation.external
    timezone = await conversation.external(() =>
      getTimezoneByCoordinates(latitude!, longitude!),
    )

    if (!isValidTimezone(timezone)) {
      await locationCtx.reply(ctx.t('onboarding-location-not-found'))
      await conversation.skip({ next: true })
    }

    await locationCtx.reply(ctx.t('onboarding-location-saved-coordinates', { timezone }), {
      reply_markup: { remove_keyboard: true },
    })
  }
  // Обработка текстового ввода
  else if (locationCtx.message?.text) {
    const input = locationCtx.message.text

    // Сначала ищем в популярных городах
    const localCity = await conversation.external(() => findCityByText(input))

    if (localCity) {
      city = localCity.name
      timezone = localCity.timezone || ''
      latitude = localCity.lat
      longitude = localCity.lon

      await locationCtx.reply(ctx.t('onboarding-location-saved', { city }))
      await locationCtx.reply(ctx.t('onboarding-timezone-saved', { timezone }), {
        reply_markup: { remove_keyboard: true },
      })
    }
    else {
      // Ищем через Geocoding API
      const [error, cities] = await conversation.external(() =>
        safe(cityService.searchCities(input)),
      )

      if (!error && cities && cities.length > 0) {
        const foundCity = cities[0]
        city = foundCity.name
        timezone = foundCity.timezone || ''
        latitude = foundCity.lat
        longitude = foundCity.lon

        await locationCtx.reply(ctx.t('onboarding-location-saved', { city }))
        await locationCtx.reply(ctx.t('onboarding-timezone-saved', { timezone }), {
          reply_markup: { remove_keyboard: true },
        })
      }
      else {
        // Проверяем координаты
        const coordinates = await conversation.external(() => parseCoordinates(input))

        if (coordinates) {
          latitude = coordinates.lat
          longitude = coordinates.lon

          // Пытаемся получить город по координатам
          const [reverseError, foundCity] = await conversation.external(() =>
            safe(cityService.getCityByCoordinates(latitude!, longitude!)),
          )

          if (!reverseError && foundCity) {
            city = foundCity.name
            timezone = foundCity.timezone || ''
          }
          else {
            timezone = await conversation.external(() =>
              getTimezoneByCoordinates(latitude!, longitude!),
            )
          }

          await locationCtx.reply(ctx.t('onboarding-timezone-saved', { timezone }), {
            reply_markup: { remove_keyboard: true },
          })
        }
        else {
          // Fallback: считаем что пользователь ввел timezone вручную
          timezone = input.trim()

          if (!isValidTimezone(timezone)) {
            await locationCtx.reply(ctx.t('onboarding-timezone-invalid'))
            await conversation.skip({ next: true })
          }

          await locationCtx.reply(ctx.t('onboarding-timezone-saved', { timezone }), {
            reply_markup: { remove_keyboard: true },
          })
        }
      }
    }
  }
  else {
    await locationCtx.reply(ctx.t('onboarding-location-invalid'))
    await conversation.skip({ next: true })
  }

  // === Сохранение данных ===
  const birthTimeUTC = birthTime
    ? await conversation.external(() =>
        User.convertBirthTimeToUTC(birthDate, birthTime!, timezone!),
      )
    : null

  // Получаем userId через conversation.external для доступа к сессии
  const userId = await conversation.external(externalCtx => externalCtx.session.user.id)

  // Обновляем пользователя через conversation.external
  const [updateError, updatedUser] = await conversation.external(() =>
    safe(
      userRepository.update(
        { id: userId },
        {
          birthDate,
          birthTime: birthTimeUTC,
          latitude,
          longitude,
          timezone,
        },
      ),
    ),
  )

  if (updateError || !updatedUser) {
    await conversation.external(externalCtx =>
      externalCtx.logger.error({ error: updateError }, 'Failed to update user during onboarding'),
    )
    await ctx.reply(ctx.t('onboarding-validation-error'))
    return
  }

  // Обновляем сессию через conversation.external
  await conversation.external((externalCtx) => {
    updateSessionUser(externalCtx, updatedUser)
    // Обновляем статус онбординга на Completed
    externalCtx.session.onboarding.status = OnboardingStatus.Completed
  })

  // Показываем профиль
  await ctx.reply(ctx.t('onboarding-completed', {
    name: updatedUser.firstName || ctx.t('onboarding-field-missing'),
    birthDate: updatedUser.birthDate || ctx.t('onboarding-field-missing'),
    birthTime: updatedUser.birthTime || ctx.t('onboarding-field-missing'),
    timezone: updatedUser.timezone || ctx.t('onboarding-field-missing'),
    city: city || ctx.t('onboarding-field-missing'),
  }), {
    reply_markup: { remove_keyboard: true },
  })
}
