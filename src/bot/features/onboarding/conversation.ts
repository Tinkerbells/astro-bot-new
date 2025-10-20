import type { Conversation } from '@grammyjs/conversations'

import type { Context } from '#root/bot/context.js'

import { safeAsync } from '#root/shared/index.js'
import { User } from '#root/domain/entities/index.js'
import { updateSessionUser } from '#root/bot/shared/helpers/user.js'
import { birthDataForm } from '#root/bot/shared/forms/birth-data/form.js'
import { OnboardingStatus } from '#root/bot/shared/types/onboarding.types.js'
import { updateOnboardingStatus } from '#root/bot/shared/helpers/onboarding.js'
import { setConversationLocale } from '#root/bot/shared/helpers/conversation-locale.js'
import { sendProfileMenuOutsideConversation } from '#root/bot/shared/menus/profile-menu/utils/send-profile-menu.js'

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

  const data = await birthDataForm(checkpoint, ctx, conversation, {
    canSkipBirthTime: true,
    conversationId: ONBOARDING_CONVERSATION,
  })

  const birthTimeUTC = data.birthTime && User.convertBirthTimeToUTC(
    data.birthDate,
    data.birthTime,
    data.birthPlace?.timezone,
  )

  const [updateError] = await safeAsync(conversation.external(async (ctx) => {
    const [error, user] = await safeAsync(ctx.userService.updateUser(
      { id: ctx.session.user.id },
      {
        birthDate: data.birthDate!,
        birthTime: birthTimeUTC,
        latitude: data.birthPlace?.latitude,
        longitude: data.birthPlace?.longitude,
        timezone: data.birthPlace?.timezone,
      },
    ))
    if (error || !user) {
      ctx.logger.error({ error }, 'Failed to update user during onboarding')
      throw error
    }
    updateSessionUser(ctx, user)
    updateOnboardingStatus(ctx, OnboardingStatus.Completed)
  }),
  )

  if (updateError) {
    await ctx.reply(ctx.t('errors-something-went-wrong'))
  }

  // Удаляем reply клавиатуру (geo request) перед отправкой меню профиля
  await ctx.reply(ctx.t('onboarding-complete'), {
    reply_markup: { remove_keyboard: true },
  })

  await conversation.external(async (ctx) => {
    await sendProfileMenuOutsideConversation(ctx)
  })
}
