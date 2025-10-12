import { Menu } from '@grammyjs/menu'

import type { Context } from '#root/bot/context.js'

import { buildProfileMenuRange } from './utils/index.js'
import { ASCENDANTS_MENU_ID, ascendantsMenu } from '../ascendants-menu/index.js'
import { NATAL_CHARTS_MENU_ID, natalChartsMenu } from '../natal-charts-menu/index.js'
import { COMPATIBILITIES_MENU_ID, compatibilitiesMenu } from '../compatibilities-menu/index.js'

export const PROFILE_MENU_ID = 'profile-menu'

/**
 * Глобальное profile меню (вне диалогов)
 * Использует динамический диапазон для генерации кнопок
 */
export const profileMenu = new Menu<Context>(PROFILE_MENU_ID).dynamic((_, range) => {
  buildProfileMenuRange(range, {
    natalChartsMenuId: NATAL_CHARTS_MENU_ID,
    ascendantsMenuId: ASCENDANTS_MENU_ID,
    compatibilitiesMenuId: COMPATIBILITIES_MENU_ID,
  })
})

profileMenu.register(natalChartsMenu)
profileMenu.register(ascendantsMenu)
profileMenu.register(compatibilitiesMenu)
