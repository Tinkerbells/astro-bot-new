import { Menu } from '@grammyjs/menu'

import type { Context } from '#root/bot/context.js'

import { MenuId } from '../menu-ids.js'
import { buildNatalChartsMenuRange } from './utils/index.js'

// TODO: добавить универсальный i18n key для back
export const personalNatalChartMenu = new Menu<Context>(MenuId.PersonalNatalChart).back(
  ctx => ctx.t('natal-charts-menu-back'),
  async (ctx) => {
    await ctx.editMessageText(ctx.t('profile-menu-natal-chart'))
  },
)

export function createNatalChartsMenu(): Menu<Context> {
  const menu = new Menu<Context>(MenuId.NatalCharts)

  menu.dynamic(async (_, range) => {
    buildNatalChartsMenuRange(range)
  })

  return menu
}

export const natalChartsMenu = createNatalChartsMenu()

natalChartsMenu.register(personalNatalChartMenu)
