import type { Conversation } from '@grammyjs/conversations'

import type { Context } from '#root/bot/context.js'

import { safeAsync } from '#root/shared/index.js'
import { User } from '#root/domain/entities/index.js'
import { updateSessionUser } from '#root/bot/shared/helpers/user.js'
import { birthDataForm } from '#root/bot/shared/forms/birth-data/form.js'
import { OnboardingStatus } from '#root/bot/shared/types/onboarding.types.js'
import { updateOnboardingStatus } from '#root/bot/shared/helpers/onboarding.js'
import { setConversationLocale } from '#root/bot/shared/helpers/conversation-locale.js'
import { buildProfileMenuRange, createProfileMessage, PROFILE_MENU_ID } from '#root/bot/shared/menus/index.js'

export const ONBOARDING_CONVERSATION = 'onboarding'

export async function onboardingConversation(
  conversation: Conversation<Context, Context>,
  ctx: Context,
) {
  await setConversationLocale(conversation, ctx)

  const checkpoint = conversation.checkpoint()

  // Обновляем статус онбординга на "В процессе"
  await conversation.external((ctx) => {
    updateOnboardingStatus(ctx, OnboardingStatus.InProgress)
  })

  await ctx.safeReply(ctx.t('onboarding-start'))

  const data = await birthDataForm(checkpoint, ctx, conversation)

  const birthTimeUTC = data.birthTime && User.convertBirthTimeToUTC(data.birthTime)

  const [updateError, updatedUser] = await safeAsync(conversation.external((ctx) => {
    ctx.userService.updateUser(
      { id: ctx.session.user.id },
      {
        birthDate: data.birthDate!,
        birthTime: birthTimeUTC,
        latitude: data.birthPlace?.latitude,
        longitude: data.birthPlace?.longitude,
        timezone: data.birthPlace?.timezone,
      },
    )
    if (updateError || !updatedUser) {
      ctx.logger.error({ error: updateError }, 'Failed to update user during onboarding')
      throw new Error('Failed to update user')
    }
    updateSessionUser(ctx, updatedUser)
    updateOnboardingStatus(ctx, OnboardingStatus.Completed)
  }),
  )

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
