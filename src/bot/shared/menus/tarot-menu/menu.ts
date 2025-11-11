import { Menu } from '@grammyjs/menu'

import type { Context } from '#root/bot/context.js'

import { MenuId } from '../menu-ids.js'
import { buildTarotMenuRange } from './utils/index.js'

// Submenu для отображения результата расклада
export const tarotReadingMenu = new Menu<Context>(MenuId.TarotReading).back(
  ctx => ctx.t('tarot-menu-back'),
  async (ctx) => {
    await ctx.editMessageText(ctx.t('tarot-menu-title'))
  },
)

export function createTarotMenu(): Menu<Context> {
  const menu = new Menu<Context>(MenuId.Tarot)

  menu.dynamic(async (_, range) => {
    buildTarotMenuRange(range)
  })

  return menu
}

export const tarotMenu = createTarotMenu()

// Регистрируем submenu
tarotMenu.register(tarotReadingMenu)
