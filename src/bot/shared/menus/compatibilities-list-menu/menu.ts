import { Menu } from '@grammyjs/menu'

import type { Context } from '#root/bot/context.js'

import { MenuId } from '../menu-ids.js'
import { buildCompatibilitiesListMenuRange } from './utils/index.js'
import { registerMenuDefinition } from '../../services/menu-manager.js'

export function createCompatibilitiesListMenu(): Menu<Context> {
  const menu = new Menu<Context>(MenuId.CompatibilitiesList)

  menu.dynamic(async (ctx, range) => {
    buildCompatibilitiesListMenuRange(range, ctx)
  })

  return menu
}

export const compatibilitiesListMenu = createCompatibilitiesListMenu()

registerMenuDefinition(MenuId.CompatibilitiesList, {
  getRootMenu: () => compatibilitiesListMenu,
})
