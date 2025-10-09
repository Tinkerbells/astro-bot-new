import type { Conversation } from '@grammyjs/conversations'

import type { Context } from '#root/bot/context.js'

import { User } from '#root/domain/entities/user/user.js'
import { safeAsync } from '#root/shared/safe-async/safe-async.js'
import { updateSessionUser } from '#root/bot/shared/helpers/user.js'
import { buildOptionalField } from '#root/bot/shared/helpers/form.js'
import { OnboardingStatus } from '#root/bot/shared/types/onboarding.types.js'
import { updateOnboardingStatus } from '#root/bot/shared/helpers/onboarding.js'
import { setConversationLocale } from '#root/bot/shared/helpers/conversation-locale.js'
import { buildProfileMenuRange, createProfileMessage, PROFILE_MENU_ID } from '#root/bot/shared/menus/index.js'

import type { BirthPlaceData } from './steps/birth-place.js'

import { BirthDateStep, BirthPlaceStep, BirthTimeStep } from './steps/index.js'
import { createBirthTimeKeyboard, createCitiesInlineKeyboard, createLocationRequestKeyboard } from './keyboards.js'

export const ONBOARDING_CONVERSATION = 'onboarding'

export const MAX_CITY_ATTEMPTS = 3

export async function onboarding(
  conversation: Conversation<Context, Context>,
  ctx: Context,
) {
  await setConversationLocale(conversation, ctx)
  // Обновляем статус онбординга на "В процессе"
  await conversation.external((ctx) => {
    updateOnboardingStatus(ctx, OnboardingStatus.InProgress)
  })

  await ctx.safeReply(ctx.t('onboarding-start'))

  await ctx.safeReply(ctx.t('onboarding-birth-date'))

  const birthDate = await conversation.form.build(BirthDateStep.toFormBuilder())

  await ctx.safeReply(ctx.t('onboarding-birth-time'), {
    reply_markup: createBirthTimeKeyboard(ctx),
  })

  const birthTime = await buildOptionalField<string>(
    conversation,
    BirthTimeStep.toFormBuilder(),
    {
      skipCallbackData: 'skip_birth_time',
    },
  )

  await ctx.safeReply(ctx.t('onboarding-location'), {
    reply_markup: createCitiesInlineKeyboard(),
  })

  await ctx.safeReply(ctx.t('onboarding-location-share'), {
    reply_markup: createLocationRequestKeyboard(ctx),
  })

  // Попытки ввода города (до 3 раз)
  let birthPlaceData: BirthPlaceData | undefined

  for (let attempt = 1; attempt <= MAX_CITY_ATTEMPTS && !birthPlaceData; attempt++) {
    // Ожидаем следующего сообщения от пользователя
    const attemptCtx = await conversation.wait({
      collationKey: `birth-place-attempt-${attempt}`,
    })

    const result = await conversation.external(() =>
      BirthPlaceStep.toFormBuilder().validate(attemptCtx),
    )

    if (result.ok) {
      // Город найден - сохраняем данные и выходим из цикла
      birthPlaceData = result.value
    }
    else if (result.error === 'city_not_found') {
      if (attempt < MAX_CITY_ATTEMPTS) {
        // Город не найден, но есть ещё попытки
        await attemptCtx.safeReply(ctx.t('onboarding-location-not-found'))
      }
      else {
        // Последняя попытка - показываем финальное сообщение
        await attemptCtx.safeReply(ctx.t('onboarding-location-not-found-final'))
      }
    }
    else {
      // Другая ошибка (не city_not_found) - показываем сообщение и прерываем попытки
      await conversation.external(() =>
        BirthPlaceStep.toFormBuilder().otherwise?.(attemptCtx, result.error),
      )
      // Прерываем цикл попыток из-за критической ошибки
      break
    }
  }

  // Если после всех попыток город не найден - запрашиваем координаты
  if (!birthPlaceData) {
    await ctx.safeReply(ctx.t('onboarding-location-not-found-try-coordinates'))

    birthPlaceData = await conversation.form.build(BirthPlaceStep.toCoordinatesFormBuilder())
  }

  // Деструктуризация результата
  const { timezone, latitude, longitude } = birthPlaceData

  const birthTimeUTC = birthTime && User.convertBirthTimeToUTC(birthDate, birthTime, timezone)

  const userId = await conversation.external(ctx => ctx.session.user.id)

  const [updateError, updatedUser] = await conversation.external(ctx =>
    safeAsync(
      ctx.userService.updateUser(
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
    await conversation.external(ctx =>
      ctx.logger.error({ error: updateError }, 'Failed to update user during onboarding'),
    )
    await ctx.safeReply(ctx.t('onboarding-validation-error'))
    // Выход из conversation - завершаем диалог из-за ошибки обновления пользователя
    return
  }

  await conversation.external((ctx) => {
    updateSessionUser(ctx, updatedUser)
    updateOnboardingStatus(ctx, OnboardingStatus.Completed)
  })

  // Удаляем reply клавиатуру (geo request) перед отправкой меню профиля
  await ctx.reply(ctx.t('onboarding-complete'), {
    reply_markup: { remove_keyboard: true },
  })

  // Создаем меню для conversation и отправляем сообщение с профилем
  const message = await conversation.external(ctx => createProfileMessage(ctx).getText())
  const menu = conversation.menu(PROFILE_MENU_ID).dynamic((_, range) => {
    buildProfileMenuRange(range)
  })

  await ctx.safeReply(message, {
    reply_markup: menu,
  })
}
