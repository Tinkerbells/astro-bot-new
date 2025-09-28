import type { Context } from '#root/bot/context.js'

import { Composer } from 'grammy'
import { logHandle } from '#root/bot/shared/helpers/logging.js'

const composer = new Composer<Context>()

const feature = composer.chatType('private')

feature.on('message', logHandle('unhandled-message'), (ctx) => {
  return ctx.reply(ctx.t('unhandled'))
})

feature.on('callback_query', logHandle('unhandled-callback-query'), (ctx) => {
  return ctx.answerCallbackQuery()
})

export { composer as unhandledFeature }
