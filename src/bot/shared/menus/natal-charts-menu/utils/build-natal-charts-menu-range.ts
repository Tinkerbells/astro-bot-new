import type { MenuRange } from '@grammyjs/menu'
import type { ConversationMenuRange } from '@grammyjs/conversations'

import type { Context } from '#root/bot/context.js'

import { safeAsync } from '#root/shared/index.js'
import { NATAL_CHARTS_GUEST_CONVERSATION } from '#root/bot/features/index.js'

export function buildNatalChartsMenuRange(
  range: MenuRange<Context> | ConversationMenuRange<Context>,
) {
  range
    .text(
      ctx => ctx.t('natal-charts-menu-my-chart'),
      async (ctx) => {
        const [error] = await safeAsync(
          ctx.natalChartsService.replyWithUserNatalChart(ctx),
        )
        if (error) {
          ctx.reply('errors-something-went-wrong')
          ctx.menu.back()
          ctx.logger.error({ err: error })
        }
      },
    )
    .row()

  range
    .text(
      ctx => ctx.t('natal-charts-menu-guest-chart'),
      async (ctx) => {
        const [error] = await safeAsync(ctx.conversation.enter(NATAL_CHARTS_GUEST_CONVERSATION))
        if (error) {
          ctx.reply('errors-something-went-wrong')
          ctx.logger.error({ err: error })
        }
      },
    )
    .row()

  range.back(ctx => ctx.t('natal-charts-menu-back'))
}
