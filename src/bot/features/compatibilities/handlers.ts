import { Composer } from 'grammy'

import type { Context } from '#root/bot/context.js'

import { logHandle } from '#root/bot/shared/helpers/logging.js'
import { compatibilitiesMenu } from '#root/bot/shared/menus/compatibilities-menu/menu.js'

export const composer = new Composer<Context>()

const feature = composer.chatType('private')

feature.command('compatibility', logHandle('command-compatibility'), async (ctx) => {
  await ctx.reply(ctx.t('compatibilities-menu-title'), {
    reply_markup: compatibilitiesMenu,
  })
})

feature.callbackQuery('compatibility:unlock', logHandle('callback-compatibility-unlock'), async (ctx) => {
  await ctx.compatibilitiesService.unlockFullCompatibility(ctx)
})

export { composer as compatibilitiesFeature }
