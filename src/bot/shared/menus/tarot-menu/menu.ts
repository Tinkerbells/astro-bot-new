import { Menu } from '@grammyjs/menu'

import type { Context } from '#root/bot/context.js'

import { MenuId } from '../menu-ids.js'
import { buildTarotMenuRange } from './utils/index.js'

export function createTarotMenu(): Menu<Context> {
  const menu = new Menu<Context>(MenuId.Tarot)

  menu.dynamic(async (_, range) => {
    buildTarotMenuRange(range)
  })

  return menu
}

export const tarotMenu = createTarotMenu()
