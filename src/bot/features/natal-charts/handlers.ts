import { Composer } from 'grammy'

import type { Context } from '#root/bot/context.js'

import { logHandle } from '#root/bot/shared/helpers/logging.js'
import { natalChartsMenu } from '#root/bot/shared/menus/natal-charts-menu/menu.js'

export const composer = new Composer<Context>()

const feature = composer.chatType('private')

feature.command('natal', logHandle('command-natal'), async (ctx) => {
  await ctx.reply(ctx.t('natal-charts-menu-title'), {
    reply_markup: natalChartsMenu,
  })
})

export { composer as natalChartsFeature }
