import type { MenuRange } from '@grammyjs/menu'
import type { ConversationMenuRange } from '@grammyjs/conversations'

import type { Context } from '#root/bot/context.js'

import { safeAsync } from '#root/shared/index.js'
import { canUseAstroFeature } from '#root/bot/shared/helpers/user.js'
import { NATAL_CHARTS_GUEST_CONVERSATION } from '#root/bot/features/index.js'

import { MenuId } from '../../menu-ids.js'
import { createProfileMessage } from '../../profile-menu/utils/create-profile-message.js'

export function buildNatalChartsMenuRange(
  range: MenuRange<Context> | ConversationMenuRange<Context>,
) {
  range
    .submenu(
      ctx => ctx.t('natal-charts-menu-my-chart'),
      MenuId.PersonalNatalChart,
      async (ctx) => {
        const [error, data] = await safeAsync(ctx.natalChartsService.getUserNatalChart(ctx))
        if (error) {
          await ctx.reply(ctx.t('errors-something-went-wrong'))
        }
        if (!error && data) {
          ctx.safeEditMarkdownMessage(data)
        }
      },
    )
    .row()

  range
    .text(
      ctx => ctx.t('natal-charts-menu-guest-chart'),
      async (ctx) => {
        if (!canUseAstroFeature(ctx.session.user)) {
          // TODO: i18n
          await ctx.reply('Вы не заполнили профиль! /onboarding')
          return
        }
        const [error] = await safeAsync(ctx.conversation.enter(NATAL_CHARTS_GUEST_CONVERSATION))
        if (error) {
          ctx.reply('errors-something-went-wrong')
          ctx.logger.error({ err: error })
        }
      },
    )
    .row()

  range.back(
    ctx => ctx.t('natal-charts-menu-back'),
    async (ctx) => {
      const messageText = createProfileMessage(ctx).getText()
      await ctx.editMessageText(messageText)
      ctx.menu.back()
    },
  )
}
