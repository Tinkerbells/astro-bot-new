import { Menu } from '@grammyjs/menu'

import type { Context } from '#root/bot/context.js'

import { MenuId } from '../menu-ids.js'
import { buildProfileMenuRange } from './utils/index.js'
import { ascendantsMenu } from '../ascendants-menu/index.js'
import { natalChartsMenu } from '../natal-charts-menu/index.js'
import { compatibilitiesMenu } from '../compatibilities-menu/index.js'
import { registerMenuDefinition } from '../../services/menu-manager.js'

/**
 * Глобальное profile меню (вне диалогов)
 * Использует динамический диапазон для генерации кнопок
 */
export const profileMenu = new Menu<Context>(MenuId.Profile).dynamic((ctx, range) => {
  buildProfileMenuRange(range, {
    natalChartsMenuId: MenuId.NatalCharts,
    ascendantsMenuId: MenuId.Ascendants,
    compatibilitiesMenuId: MenuId.Compatibilities,
  })
})

profileMenu.register(natalChartsMenu)
profileMenu.register(ascendantsMenu)
profileMenu.register(compatibilitiesMenu)

registerMenuDefinition(MenuId.Profile, {
  getRootMenu: () => profileMenu,
  buildConversationRange: (_, range) => {
    buildProfileMenuRange(range)
  },
})
