import type { Conversation } from '@grammyjs/conversations'

import type { Context } from '#root/bot/context.js'

import { User } from '#root/domain/entities/user/user.js'
import { safeAsync } from '#root/shared/safe-async/safe-async.js'
import { updateSessionUser } from '#root/bot/shared/helpers/user.js'
import { buildOptionalField } from '#root/bot/shared/helpers/form.js'
import { createProfileMessage } from '#root/bot/features/profile/menu.js'
import { OnboardingStatus } from '#root/bot/shared/types/onboarding.types.js'
import { updateOnboardingStatus } from '#root/bot/shared/helpers/onboarding.js'

import type { BirthPlaceData } from './steps/birth-place.js'

import { BirthDateStep, BirthPlaceStep, BirthTimeStep } from './steps/index.js'
import { createBirthTimeKeyboard, createCitiesInlineKeyboard, createLocationRequestKeyboard } from './keyboards.js'

export const ONBOARDING_CONVERSATION = 'onboarding'

export async function onboarding(
  conversation: Conversation<Context, Context>,
  ctx: Context,
) {
  await conversation.external((ctx) => {
    updateOnboardingStatus(ctx, OnboardingStatus.InProgress)
  })

  const [startError] = await safeAsync(ctx.reply(ctx.t('onboarding-start')))
  if (startError) {
    await conversation.external(ctx =>
      ctx.logger.error({ error: startError }, 'Failed to send onboarding start message'),
    )
    await safeAsync(ctx.reply(ctx.t('errors-something-went-wrong')))
    return
  }

  const [birthDatePromptError] = await safeAsync(ctx.reply(ctx.t('onboarding-birth-date')))
  if (birthDatePromptError) {
    await conversation.external(ctx =>
      ctx.logger.error({ error: birthDatePromptError }, 'Failed to send birth date prompt'),
    )
    await safeAsync(ctx.reply(ctx.t('errors-something-went-wrong')))
    return
  }

  const birthDate = await conversation.form.build(BirthDateStep.toFormBuilder())

  const [birthTimePromptError] = await safeAsync(
    ctx.reply(ctx.t('onboarding-birth-time'), {
      reply_markup: createBirthTimeKeyboard(ctx),
    }),
  )

  if (birthTimePromptError) {
    await conversation.external(ctx =>
      ctx.logger.error({ error: birthTimePromptError }, 'Failed to send birth time prompt'),
    )
    await safeAsync(ctx.reply(ctx.t('errors-something-went-wrong')))
    return
  }

  const birthTime = await buildOptionalField<string>(
    conversation,
    BirthTimeStep.toFormBuilder(),
    {
      skipCallbackData: 'skip_birth_time',
    },
  )

  const [locationPromptError] = await safeAsync(
    ctx.reply(ctx.t('onboarding-location'), {
      reply_markup: createCitiesInlineKeyboard(),
    }),
  )
  if (locationPromptError) {
    await conversation.external(ctx =>
      ctx.logger.error({ error: locationPromptError }, 'Failed to send location prompt'),
    )
    await safeAsync(ctx.reply(ctx.t('errors-something-went-wrong')))
    return
  }

  const [locationSharePromptError] = await safeAsync(
    ctx.reply(ctx.t('onboarding-location-share'), {
      reply_markup: createLocationRequestKeyboard(ctx),
    }),
  )
  if (locationSharePromptError) {
    await conversation.external(ctx =>
      ctx.logger.error({ error: locationSharePromptError }, 'Failed to send location share prompt'),
    )
    await safeAsync(ctx.reply(ctx.t('errors-something-went-wrong')))
    return
  }

  let birthPlaceData: BirthPlaceData

  // Первая попытка: город или геолокация
  const firstAttempt = await conversation.wait({
    collationKey: 'birth-place-first-attempt',
  })

  const firstResult = await conversation.external(() =>
    BirthPlaceStep.toFormBuilder().validate(firstAttempt),
  )

  if (firstResult.ok) {
    birthPlaceData = firstResult.value
  }
  else if (firstResult.error === 'city_not_found') {
    // Город не найден - предлагаем ввести координаты
    const [notFoundError] = await safeAsync(
      firstAttempt.reply(ctx.t('onboarding-location-not-found-try-coordinates')),
    )
    if (notFoundError) {
      await conversation.external(ctx =>
        ctx.logger.error({ error: notFoundError }, 'Failed to send city not found message'),
      )
      await safeAsync(ctx.reply(ctx.t('errors-something-went-wrong')))
      return
    }

    birthPlaceData = await conversation.form.build(BirthPlaceStep.toCoordinatesFormBuilder())
  }
  else {
    // Другая ошибка - показываем сообщение и прерываем
    await conversation.external(() =>
      BirthPlaceStep.toFormBuilder().otherwise?.(firstAttempt, firstResult.error),
    )
    await conversation.skip({ next: true })
    return
  }

  // Деструктуризация результата
  const { timezone, latitude, longitude } = birthPlaceData

  const birthTimeUTC = birthTime && await conversation.external(() =>
    User.convertBirthTimeToUTC(birthDate, birthTime, timezone),
  )

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
    const [errorReplyError] = await safeAsync(ctx.reply(ctx.t('onboarding-validation-error')))
    if (errorReplyError) {
      await conversation.external(ctx =>
        ctx.logger.error({ error: errorReplyError }, 'Failed to send validation error message'),
      )
    }
    return
  }

  await conversation.external((ctx) => {
    updateSessionUser(ctx, updatedUser)
    updateOnboardingStatus(ctx, OnboardingStatus.Completed)
  })

  const [messageError, completeMessage] = await safeAsync(
    conversation.external((ctx) => {
      const { ctx: _, ...options } = { ctx, user: updatedUser }
      return createProfileMessage({ ctx, ...options }).getText()
    }),
  )

  if (messageError || !completeMessage) {
    await conversation.external(ctx =>
      ctx.logger.error({ error: messageError }, 'Failed to create profile message'),
    )
    const [fallbackError] = await safeAsync(ctx.reply(ctx.t('onboarding-complete')))
    if (fallbackError) {
      await conversation.external(ctx =>
        ctx.logger.error({ error: fallbackError }, 'Failed to send onboarding complete message'),
      )
    }
    return
  }

  const [completeReplyError] = await safeAsync(
    ctx.reply(completeMessage),
  )

  if (completeReplyError) {
    await conversation.external(ctx =>
      ctx.logger.error({ error: completeReplyError }, 'Failed to send onboarding completion message'),
    )
    await safeAsync(ctx.reply(ctx.t('errors-something-went-wrong')))
  }
}
