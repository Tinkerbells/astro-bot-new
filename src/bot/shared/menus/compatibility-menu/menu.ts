import { Menu } from '@grammyjs/menu'

import type { Context } from '#root/bot/context.js'

import { MenuId } from '../menu-ids.js'

export const compatibilityMenu = new Menu<Context>(MenuId.Compatibility).back(
  ctx => ctx.t('compatibilities-menu-back'),
  async (ctx) => {
    await ctx.editMessageText(ctx.t('compatibilities-menu-my-compatibilities'))
  },
)
