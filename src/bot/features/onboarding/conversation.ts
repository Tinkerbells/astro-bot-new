import type { Conversation } from '@grammyjs/conversations'

import type { Context } from '#root/bot/context.js'

import { safe } from '#root/shared/safe/index.js'
import { User } from '#root/domain/entities/user/user.js'
import { updateSessionUser } from '#root/bot/shared/helpers/user.js'
import { buildOptionalField } from '#root/bot/shared/helpers/form-utils.js'
import { OnboardingStatus } from '#root/bot/shared/types/onboarding.types.js'
import { userRepository } from '#root/data/repositories/user-repository/index.js'
import { createProfileMessage, PROFILE_MENU_ID } from '#root/bot/features/profile/menu.js'

import type { BirthPlaceData } from './steps/birth-place-step.js'

import { BirthDateStep } from './steps/birth-date-step.js'
import { BirthTimeStep } from './steps/birth-time-step.js'
import { BirthPlaceStep } from './steps/birth-place-step.js'
import { createBirthTimeKeyboard, createCitiesInlineKeyboard, createLocationRequestKeyboard } from './keyboards.js'

export const ONBOARDING_CONVERSATION = 'onboarding'

export async function onboarding(
  conversation: Conversation<Context, Context>,
  ctx: Context,
) {
  await conversation.external((externalCtx) => {
    externalCtx.session.onboarding.status = OnboardingStatus.InProgress
  })

  await ctx.reply(ctx.t('onboarding-start'))

  await ctx.reply(ctx.t('onboarding-birth-date'))

  const birthDate = await conversation.form.build(BirthDateStep.toFormBuilder())

  await ctx.reply(ctx.t('onboarding-birth-time'), {
    reply_markup: createBirthTimeKeyboard(ctx),
  })

  const birthTime = await buildOptionalField<string>(
    conversation,
    ctx,
    BirthTimeStep.toFormBuilder(),
    {
      skipCallbackData: 'skip_birth_time',
      skipMessage: ctx.t('onboarding-birth-time-skipped'),
      successMessage: ctx.t('onboarding-birth-time-received'),
    },
  )

  await ctx.reply(ctx.t('onboarding-location'), {
    reply_markup: createCitiesInlineKeyboard(),
  })

  await ctx.reply(ctx.t('onboarding-location-share'), {
    reply_markup: createLocationRequestKeyboard(ctx),
  })

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
    await firstAttempt.reply(ctx.t('onboarding-location-not-found-try-coordinates'))

    birthPlaceData = await conversation.form.build(BirthPlaceStep.toCoordinatesFormBuilder())
  }
  else {
    // Другая ошибка - показываем сообщение и прерываем
    await conversation.external(() =>
      BirthPlaceStep.toFormBuilder().otherwise(firstAttempt, firstResult.error),
    )
    await conversation.skip({ next: true })
    return
  }

  // Деструктуризация результата
  const { city, timezone, latitude, longitude } = birthPlaceData

  const birthTimeUTC = birthTime && await conversation.external(() =>
    User.convertBirthTimeToUTC(birthDate, birthTime, timezone),
  )

  const userId = await conversation.external(externalCtx => externalCtx.session.user.id)

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

  await conversation.external((externalCtx) => {
    updateSessionUser(externalCtx, updatedUser)
    externalCtx.session.onboarding.status = OnboardingStatus.Completed
  })

  // Показываем завершающее сообщение
  await ctx.reply(ctx.t('onboarding-completed', {
    name: updatedUser.firstName ?? ctx.t('onboarding-field-missing'),
    birthDate: updatedUser.birthDate ?? ctx.t('onboarding-field-missing'),
    birthTime: updatedUser.birthTime ?? ctx.t('onboarding-field-missing'),
    timezone: updatedUser.timezone ?? ctx.t('onboarding-field-missing'),
    city: city ?? ctx.t('onboarding-field-missing'),
  }))

  // Показываем профиль с меню
  const message = await conversation.external(externalCtx =>
    createProfileMessage({ ctx: externalCtx, user: updatedUser }),
  )
  await ctx.reply(message.getText(), {
    reply_markup: conversation.menu(PROFILE_MENU_ID),
  })
}
