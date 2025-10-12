import { Menu } from '@grammyjs/menu'

import type { Context } from '#root/bot/context.js'

import { buildCompatibilitiesMenuRange } from './utils/index.js'
import { compatibilitiesListMenu } from '../compatibilities-list-menu/index.js'

export const COMPATIBILITIES_MENU_ID = 'compatibilities-menu'

export function createCompatibilitiesMenu(): Menu<Context> {
  const menu = new Menu<Context>(COMPATIBILITIES_MENU_ID)

  menu.dynamic(async (_, range) => {
    buildCompatibilitiesMenuRange(range)
  })

  menu.register(compatibilitiesListMenu)

  return menu
}

export const compatibilitiesMenu = createCompatibilitiesMenu()
