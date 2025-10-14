import { Menu } from '@grammyjs/menu'

import type { Context } from '#root/bot/context.js'

import { MenuId } from '../menu-ids.js'
import { buildCompatibilitiesMenuRange } from './utils/index.js'
import { registerMenuDefinition } from '../../services/menu-manager.js'
import { compatibilitiesListMenu } from '../compatibilities-list-menu/index.js'

export function createCompatibilitiesMenu(): Menu<Context> {
  const menu = new Menu<Context>(MenuId.Compatibilities)

  menu.dynamic(async (_, range) => {
    buildCompatibilitiesMenuRange(range)
  })

  menu.register(compatibilitiesListMenu)

  return menu
}

export const compatibilitiesMenu = createCompatibilitiesMenu()

registerMenuDefinition(MenuId.Compatibilities, {
  getRootMenu: () => compatibilitiesMenu,
})
