import type { MenuRange } from '@grammyjs/menu'
import type { ConversationMenuRange } from '@grammyjs/conversations'

import type { Context } from '#root/bot/context.js'

import { safeAsync } from '#root/shared/index.js'
import { COMPATIBILITIES_GUEST_CONVERSATION } from '#root/bot/features/index.js'

import { COMPATIBILITIES_LIST_MENU_ID } from '../../../menus/compatibilities-list-menu/index.js'

export function buildCompatibilitiesMenuRange(
  range: MenuRange<Context> | ConversationMenuRange<Context>,
) {
  range
    .text(
      ctx => ctx.t('compatibilities-menu-user-guest'),
      async (ctx) => {
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
      COMPATIBILITIES_LIST_MENU_ID,
      async (ctx) => {
        const [error] = await safeAsync(
          ctx.natalChartCompatibilitiesService.loadUserCompatibilities(ctx),
        )
        if (error) {
          ctx.reply('errors-something-went-wrong')
          ctx.logger.error({ err: error })
        }
      },
    )
    .row()

  range.back(ctx => ctx.t('compatibilities-menu-back'))
}
