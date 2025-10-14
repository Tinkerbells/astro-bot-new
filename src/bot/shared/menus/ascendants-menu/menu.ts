import { Menu } from '@grammyjs/menu'

import type { Context } from '#root/bot/context.js'

import { MenuId } from '../menu-ids.js'
import { buildAscendantsMenuRange } from './utils/index.js'
import { registerMenuDefinition } from '../../services/menu-manager.js'

export function createAscendantsMenu(): Menu<Context> {
  const menu = new Menu<Context>(MenuId.Ascendants)

  menu.dynamic(async (_, range) => {
    buildAscendantsMenuRange(range)
  })

  return menu
}

export const ascendantsMenu = createAscendantsMenu()

registerMenuDefinition(MenuId.Ascendants, {
  getRootMenu: () => ascendantsMenu,
})
