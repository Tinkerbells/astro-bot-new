import { Composer } from 'grammy'

import type { Context } from '#root/bot/context.js'

import { logHandle } from '#root/bot/shared/helpers/logging.js'

import { GREETING_CONVERSATION } from './conversations/greeting.js'

const composer = new Composer<Context>()

const feature = composer.chatType('private')

feature.command('start', logHandle('command-start'), (ctx) => {
  return ctx.reply(`${ctx.t('welcome')} ${ctx.session.user.firstName}`)
})

feature.command('greeting', logHandle('command-greeting'), (ctx) => {
  return ctx.conversation.enter(GREETING_CONVERSATION)
})

export { composer as onboardingFeature }
