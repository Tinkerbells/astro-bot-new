import type { MenuRange } from '@grammyjs/menu'
import type { ConversationMenuRange } from '@grammyjs/conversations'

import type { Context } from '#root/bot/context.js'

import { safeAsync } from '#root/shared/index.js'
import { canUseAstroFeature } from '#root/bot/shared/helpers/user.js'
import { COMPATIBILITIES_GUEST_CONVERSATION } from '#root/bot/features/index.js'

import { MenuId } from '../../menu-ids.js'
import { createProfileMessage } from '../../profile-menu/utils/create-profile-message.js'

export function buildCompatibilitiesMenuRange(
  range: MenuRange<Context> | ConversationMenuRange<Context>,
) {
  range
    .text(
      ctx => ctx.t('compatibilities-menu-user-guest'),
      async (ctx) => {
        if (!canUseAstroFeature(ctx.session.user)) {
          // TODO: i18n
          await ctx.reply('Вы не заполнили профиль! /onboarding')
          return
        }
        const [error] = await safeAsync(ctx.conversation.enter(COMPATIBILITIES_GUEST_CONVERSATION))
        if (error) {
          ctx.reply('errors-something-went-wrong')
          ctx.logger.error({ err: error })
        }
      },
    )
    .row()

  range
    .submenu(
      ctx => ctx.t('compatibilities-menu-my-compatibilities'),
      MenuId.CompatibilitiesList,
      async (ctx) => {
        const [error] = await safeAsync(
          ctx.compatibilitiesService.loadUserCompatibilities(ctx),
        )
        if (error) {
          ctx.reply('errors-something-went-wrong')
          ctx.logger.error({ err: error })
        }
        else {
          await ctx.editMessageText(ctx.t('profile-menu-compatibility'))
        }
      },
    )
    .row()

  range.back(
    ctx => ctx.t('compatibilities-menu-back'),
    async (ctx) => {
      const messageText = createProfileMessage(ctx).getText()
      await ctx.editMessageText(messageText)
      ctx.menu.back()
    },
  )
}
