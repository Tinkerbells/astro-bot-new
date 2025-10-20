import { Menu } from '@grammyjs/menu'

import type { Context } from '#root/bot/context.js'

import { MenuId } from '../menu-ids.js'
import { buildAscendantsMenuRange } from './utils/index.js'

// TODO: добавить универсальный i18n key для back
export const personalAscendantMenu = new Menu<Context>(MenuId.PersonalAscendant).back(
  ctx => ctx.t('ascendants-menu-back'),
  async (ctx) => {
    await ctx.editMessageText(ctx.t('profile-menu-ascendant'))
  },
)

export function createAscendantsMenu(): Menu<Context> {
  const menu = new Menu<Context>(MenuId.Ascendants)

  menu.dynamic(async (_, range) => {
    buildAscendantsMenuRange(range)
  })

  return menu
}

export const ascendantsMenu = createAscendantsMenu()

ascendantsMenu.register(personalAscendantMenu)
