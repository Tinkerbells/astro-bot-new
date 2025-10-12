import type { MenuRange } from '@grammyjs/menu'
import type { ConversationMenuRange } from '@grammyjs/conversations'

import type { Context } from '#root/bot/context.js'

import { safeAsync } from '#root/shared/index.js'
import { ASCENDANTS_GUEST_CONVERSATION } from '#root/bot/features/index.js'

export function buildAscendantsMenuRange(
  range: MenuRange<Context> | ConversationMenuRange<Context>,
) {
  range
    .text(
      ctx => ctx.t('ascendants-menu-my-ascendant'),
      async (ctx) => {
        const [error] = await safeAsync(
          ctx.ascendantsService.replyWithUserAscendant(ctx),
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
      ctx => ctx.t('ascendants-menu-guest-ascendant'),
      async (ctx) => {
        const [error] = await safeAsync(ctx.conversation.enter(ASCENDANTS_GUEST_CONVERSATION))
        if (error) {
          ctx.reply('errors-something-went-wrong')
          ctx.logger.error({ err: error })
        }
      },
    )
    .row()

  range.back(ctx => ctx.t('ascendants-menu-back'))
}
