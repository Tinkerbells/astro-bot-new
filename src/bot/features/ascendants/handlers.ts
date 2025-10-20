import { Composer } from 'grammy'

import type { Context } from '#root/bot/context.js'

import { logHandle } from '#root/bot/shared/helpers/logging.js'
import { ascendantsMenu } from '#root/bot/shared/menus/ascendants-menu/menu.js'

export const composer = new Composer<Context>()

const feature = composer.chatType('private')

feature.command('ascendant', logHandle('command-ascendant'), async (ctx) => {
  await ctx.reply(ctx.t('ascendants-menu-title'), {
    reply_markup: ascendantsMenu,
  })
})

export { composer as ascendantsFeature }
