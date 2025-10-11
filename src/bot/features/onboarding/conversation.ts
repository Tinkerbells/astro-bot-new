import type { Conversation } from '@grammyjs/conversations'

import type { Context } from '#root/bot/context.js'
import type { OnboardingAstroDataResult } from '#root/bot/shared/forms/astro-data/index.js'

import { safeAsync } from '#root/shared/safe-async/safe-async.js'
import { updateSessionUser } from '#root/bot/shared/helpers/user.js'
import { OnboardingStatus } from '#root/bot/shared/types/onboarding.types.js'
import { updateOnboardingStatus } from '#root/bot/shared/helpers/onboarding.js'
import { collectOnboardingAstroData } from '#root/bot/shared/forms/astro-data/index.js'
import { setConversationLocale } from '#root/bot/shared/helpers/conversation-locale.js'
import { buildProfileMenuRange, createProfileMessage, PROFILE_MENU_ID } from '#root/bot/shared/menus/index.js'

export const ONBOARDING_CONVERSATION = 'onboarding'

export async function onboardingConversation(
  conversation: Conversation<Context, Context>,
  ctx: Context,
) {
  await setConversationLocale(conversation, ctx)

  // Обновляем статус онбординга на "В процессе"
  await conversation.external((ctx) => {
    updateOnboardingStatus(ctx, OnboardingStatus.InProgress)
  })

  await ctx.safeReply(ctx.t('onboarding-start'))

  // Используем универсальный сборщик астро-данных с callback
  await collectOnboardingAstroData(conversation, ctx, {
    allowSkipBirthTime: true,
    callback: async (ctx, data: OnboardingAstroDataResult) => {
      const userId = ctx.session.user.id

      const [updateError, updatedUser] = await safeAsync(
        ctx.userService.updateUser(
          { id: userId },
          {
            birthDate: data.birthDate,
            birthTime: data.birthTimeUTC,
            latitude: data.latitude,
            longitude: data.longitude,
            timezone: data.timezone,
          },
        ),
      )

      if (updateError || !updatedUser) {
        ctx.logger.error({ error: updateError }, 'Failed to update user during onboarding')
        throw new Error('Failed to update user')
      }

      updateSessionUser(ctx, updatedUser)
      updateOnboardingStatus(ctx, OnboardingStatus.Completed)
    },
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
