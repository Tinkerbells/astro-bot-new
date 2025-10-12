import { Menu } from '@grammyjs/menu'

import type { Context } from '#root/bot/context.js'

import { buildAscendantsMenuRange } from './utils/index.js'

export const ASCENDANTS_MENU_ID = 'ascendants-menu'

export function createAscendantsMenu(): Menu<Context> {
  const menu = new Menu<Context>(ASCENDANTS_MENU_ID)

  menu.dynamic(async (_, range) => {
    buildAscendantsMenuRange(range)
  })

  return menu
}

export const ascendantsMenu = createAscendantsMenu()
