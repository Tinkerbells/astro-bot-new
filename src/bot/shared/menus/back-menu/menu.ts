import { Menu } from '@grammyjs/menu'

import type { Context } from '#root/bot/context.js'

import { MenuId } from '../menu-ids.js'

// TODO: добавить универсальный i18n key для back
export const backMenu = new Menu<Context>(MenuId.Back).text(ctx => ctx.t('ascendants-menu-back'), ctx => ctx.menu.back())
