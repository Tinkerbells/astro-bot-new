import { Menu } from '@grammyjs/menu'

import type { Context } from '#root/bot/context.js'

import { buildCompatibilitiesListMenuRange } from './utils/index.js'

export const COMPATIBILITIES_LIST_MENU_ID = 'compatibilities-list-menu'

export function createCompatibilitiesListMenu(): Menu<Context> {
  const menu = new Menu<Context>(COMPATIBILITIES_LIST_MENU_ID)

  menu.dynamic(async (ctx, range) => {
    buildCompatibilitiesListMenuRange(range, ctx)
  })

  return menu
}

export const compatibilitiesListMenu = createCompatibilitiesListMenu()
