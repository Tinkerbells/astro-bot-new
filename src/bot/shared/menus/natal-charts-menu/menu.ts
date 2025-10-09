import { Menu } from '@grammyjs/menu'

import type { Context } from '#root/bot/context.js'

import { buildNatalChartsMenuRange } from './utils/index.js'

export const NATAL_CHARTS_MENU_ID = 'natal-charts-menu'

export function createNatalChartsMenu(): Menu<Context> {
  const menu = new Menu<Context>(NATAL_CHARTS_MENU_ID)

  menu.dynamic(async (_, range) => {
    buildNatalChartsMenuRange(range)
  })

  return menu
}

export const natalChartsMenu = createNatalChartsMenu()
