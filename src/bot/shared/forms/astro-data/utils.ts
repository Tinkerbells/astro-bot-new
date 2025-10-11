import type { Conversation } from '@grammyjs/conversations'

import type { Context } from '#root/bot/context.js'

import { User } from '#root/domain/entities/user/user.js'
import { buildOptionalField } from '#root/bot/shared/helpers/form.js'

import type {
  AstroDataOptions,
  AstroDataResult,
  BirthPlaceData,
  OnboardingAstroDataOptions,
  OnboardingAstroDataResult,
} from './types.js'

import { BirthDateStep, BirthPlaceStep, BirthTimeStep } from './steps/index.js'
import { createBirthTimeSkipKeyboard, createCitiesInlineKeyboard, createLocationRequestKeyboard } from './keyboards.js'

export const DEFAULT_MAX_CITY_ATTEMPTS = 3

/**
 * Собирает астрологические данные с обязательным временем рождения (для гостей)
 *
 * Эта функция запрашивает у пользователя:
 * - Дату рождения (обязательно)
 * - Время рождения (обязательно, без возможности пропустить)
 * - Место рождения (город или координаты)
 *
 * После сбора всех данных вызывается callback с результатом.
 * Используйте эту функцию когда необходимо точное время рождения для астрологических расчетов.
 *
 * @param conversation - grammY conversation instance
 * @param ctx - Bot context
 * @param options - Опции сбора данных с callback
 *
 * @example
 * ```ts
 * export async function guestNatalChartConversation(
 *   conversation: Conversation<Context, Context>,
 *   ctx: Context,
 * ) {
 *   await collectAstroData(conversation, ctx, {
 *     callback: async (ctx, data) => {
 *       // data.birthTime и data.birthTimeUTC всегда определены!
 *       const chart = await ctx.natalChartsService.generateGuestChart({
 *         birthDate: data.birthDate,
 *         birthTime: data.birthTimeUTC,
 *         latitude: data.latitude,
 *         longitude: data.longitude,
 *       })
 *
 *       await ctx.reply(`Натальная карта для ${data.city || 'указанной локации'}`)
 *       await ctx.replyWithPhoto(chart.imageUrl)
 *     },
 *     maxCityAttempts: 5, // По умолчанию 3
 *   })
 * }
 * ```
 *
 * @throws {Error} Если не удалось конвертировать время в UTC
 */
export async function collectAstroData(
  conversation: Conversation<Context, Context>,
  ctx: Context,
  options: AstroDataOptions,
): Promise<void> {
  const { callback, maxCityAttempts = DEFAULT_MAX_CITY_ATTEMPTS } = options

  // Запрашиваем дату рождения
  await ctx.safeReply(ctx.t('astro-data-birth-date'))
  const birthDate = await conversation.form.build(
    BirthDateStep.toFormBuilder(ctx.t('astro-data-birth-date-invalid')),
  )

  // Запрашиваем время рождения (обязательно)
  await ctx.safeReply(ctx.t('astro-data-birth-time'))
  const birthTime = await conversation.form.build(
    BirthTimeStep.toRequiredFormBuilder(ctx.t('astro-data-birth-time-invalid')),
  )

  // Запрашиваем место рождения
  await ctx.safeReply(ctx.t('astro-data-location'), {
    reply_markup: createCitiesInlineKeyboard(),
  })

  await ctx.safeReply(ctx.t('astro-data-location-share'), {
    reply_markup: createLocationRequestKeyboard(ctx),
  })

  // Попытки ввода города
  const birthPlaceData = await collectBirthPlace(conversation, ctx, maxCityAttempts)

  // Деструктуризация результата
  const { timezone, latitude, longitude, city } = birthPlaceData

  // Конвертируем время рождения в UTC
  const birthTimeUTC = User.convertBirthTimeToUTC(birthDate, birthTime, timezone)

  // Для обязательного birthTime должен быть и birthTimeUTC
  if (!birthTimeUTC) {
    throw new Error('Failed to convert birth time to UTC')
  }

  const result: AstroDataResult = {
    birthDate,
    birthTime,
    birthTimeUTC,
    city,
    timezone,
    latitude,
    longitude,
  }

  // Вызываем callback
  await conversation.external(ctx => callback(ctx, result))
}

/**
 * Собирает астрологические данные с опциональным временем рождения (для onboarding)
 *
 * Эта функция запрашивает у пользователя:
 * - Дату рождения (обязательно)
 * - Время рождения (опционально, можно пропустить кнопкой "Пропустить")
 * - Место рождения (город или координаты)
 *
 * Если пользователь пропускает время рождения, поля `birthTime` и `birthTimeUTC` будут `null`.
 * После сбора всех данных вызывается callback с результатом.
 *
 * @param conversation - grammY conversation instance
 * @param ctx - Bot context
 * @param options - Опции сбора данных с callback (allowSkipBirthTime должен быть true)
 *
 * @example
 * ```ts
 * export async function onboarding(
 *   conversation: Conversation<Context, Context>,
 *   ctx: Context,
 * ) {
 *   await collectOnboardingAstroData(conversation, ctx, {
 *     allowSkipBirthTime: true,
 *     callback: async (ctx, data) => {
 *       const userId = ctx.session.user.id
 *
 *       const updatedUser = await ctx.userService.updateUser(
 *         { id: userId },
 *         {
 *           birthDate: data.birthDate,
 *           birthTime: data.birthTimeUTC, // Может быть null
 *           latitude: data.latitude,
 *           longitude: data.longitude,
 *           timezone: data.timezone,
 *         },
 *       )
 *
 *       updateSessionUser(ctx, updatedUser)
 *     },
 *   })
 *
 *   await ctx.reply('Профиль настроен!')
 * }
 * ```
 */
export async function collectOnboardingAstroData(
  conversation: Conversation<Context, Context>,
  ctx: Context,
  options: OnboardingAstroDataOptions,
): Promise<void> {
  const { callback, maxCityAttempts = DEFAULT_MAX_CITY_ATTEMPTS } = options

  // Запрашиваем дату рождения
  await ctx.safeReply(ctx.t('astro-data-birth-date'))
  const birthDate = await conversation.form.build(
    BirthDateStep.toFormBuilder(ctx.t('astro-data-birth-date-invalid')),
  )

  // Запрашиваем время рождения (опционально)
  await ctx.safeReply(ctx.t('astro-data-birth-time'), {
    reply_markup: createBirthTimeSkipKeyboard(ctx, 'skip_birth_time', 'astro-data-skip'),
  })

  const birthTime = await buildOptionalField<string>(
    conversation,
    BirthTimeStep.toOptionalFormBuilder(ctx.t('astro-data-birth-time-invalid')),
    {
      skipCallbackData: 'skip_birth_time',
    },
  )

  // Запрашиваем место рождения
  await ctx.safeReply(ctx.t('astro-data-location'), {
    reply_markup: createCitiesInlineKeyboard(),
  })

  await ctx.safeReply(ctx.t('astro-data-location-share'), {
    reply_markup: createLocationRequestKeyboard(ctx),
  })

  // Попытки ввода города
  const birthPlaceData = await collectBirthPlace(conversation, ctx, maxCityAttempts)

  // Деструктуризация результата
  const { timezone, latitude, longitude, city } = birthPlaceData

  // Конвертируем время рождения в UTC (если указано)
  const birthTimeUTC = birthTime ? User.convertBirthTimeToUTC(birthDate, birthTime, timezone) : null

  const result: OnboardingAstroDataResult = {
    birthDate,
    birthTime: birthTime ?? null,
    birthTimeUTC: birthTimeUTC ?? null,
    city,
    timezone,
    latitude,
    longitude,
  }

  // Вызываем callback
  await conversation.external(ctx => callback(ctx, result))
}

/**
 * Вспомогательная функция для сбора данных о месте рождения
 * Обрабатывает несколько попыток поиска города
 */
async function collectBirthPlace(
  conversation: Conversation<Context, Context>,
  ctx: Context,
  maxAttempts: number,
): Promise<BirthPlaceData> {
  let birthPlaceData: BirthPlaceData | undefined

  const callbackDataPrefix = 'astro-data:timezone:city'
  const invalidMessage = ctx.t('astro-data-location-invalid')

  for (let attempt = 1; attempt <= maxAttempts && !birthPlaceData; attempt++) {
    // Ожидаем следующего сообщения от пользователя
    const attemptCtx = await conversation.wait({
      collationKey: `birth-place-attempt-${attempt}`,
    })

    const result = await conversation.external(() =>
      BirthPlaceStep.toFormBuilder(callbackDataPrefix, invalidMessage).validate(attemptCtx),
    )

    if (result.ok) {
      // Город найден - сохраняем данные и выходим из цикла
      birthPlaceData = result.value
    }
    else if (result.error === 'city_not_found') {
      if (attempt < maxAttempts) {
        // Город не найден, но есть ещё попытки
        await attemptCtx.safeReply(ctx.t('astro-data-location-not-found'))
      }
      else {
        // Последняя попытка - показываем финальное сообщение
        await attemptCtx.safeReply(ctx.t('astro-data-location-not-found-final'))
      }
    }
    else {
      // Другая ошибка (не city_not_found) - показываем сообщение и прерываем попытки
      await conversation.external(() =>
        BirthPlaceStep.toFormBuilder(callbackDataPrefix, invalidMessage).otherwise?.(attemptCtx, result.error),
      )
      // Прерываем цикл попыток из-за критической ошибки
      break
    }
  }

  // Если после всех попыток город не найден - запрашиваем координаты
  if (!birthPlaceData) {
    await ctx.safeReply(ctx.t('astro-data-location-not-found-try-coordinates'))
    birthPlaceData = await conversation.form.build(
      BirthPlaceStep.toCoordinatesFormBuilder(ctx.t('astro-data-coordinates-invalid')),
    )
  }

  return birthPlaceData
}
