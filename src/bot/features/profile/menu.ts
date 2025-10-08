import { Menu } from '@grammyjs/menu'

import type { Context } from '#root/bot/context.js'

import { buildProfileMenuRange } from './utils/index.js'

export const PROFILE_MENU_ID = 'profile-menu'

/**
 * Глобальное profile меню (вне диалогов)
 * Использует динамический диапазон для генерации кнопок
 */
export const profileMenu = new Menu<Context>(PROFILE_MENU_ID).dynamic((_, range) => {
  buildProfileMenuRange(range)
})
