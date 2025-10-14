import { Menu } from '@grammyjs/menu'

import type { Context } from '#root/bot/context.js'

import { MenuId } from '../menu-ids.js'
import { buildNatalChartsMenuRange } from './utils/index.js'
import { registerMenuDefinition } from '../../services/menu-manager.js'

export function createNatalChartsMenu(): Menu<Context> {
  const menu = new Menu<Context>(MenuId.NatalCharts)

  menu.dynamic(async (_, range) => {
    buildNatalChartsMenuRange(range)
  })

  return menu
}

export const natalChartsMenu = createNatalChartsMenu()

registerMenuDefinition(MenuId.NatalCharts, {
  getRootMenu: () => natalChartsMenu,
})
