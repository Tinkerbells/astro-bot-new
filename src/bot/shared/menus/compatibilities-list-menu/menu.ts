import { Menu } from '@grammyjs/menu'

import type { Context } from '#root/bot/context.js'

import { MenuId } from '../menu-ids.js'
import { compatibilityMenu } from '../compatibility-menu/menu.js'
import { buildCompatibilitiesListMenuRange } from './utils/index.js'

export function createCompatibilitiesListMenu(): Menu<Context> {
  const menu = new Menu<Context>(MenuId.CompatibilitiesList)

  menu.dynamic(async (ctx, range) => {
    await buildCompatibilitiesListMenuRange(range, ctx)
  })

  return menu
}

export const compatibilitiesListMenu = createCompatibilitiesListMenu()

compatibilitiesListMenu.register(compatibilityMenu)
