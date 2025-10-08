import { Composer } from 'grammy'

import type { Context } from '#root/bot/context.js'

import { logHandle } from '#root/bot/shared/helpers/logging.js'
import { isOnboardingComplete } from '#root/bot/shared/helpers/onboarding.js'

import { ONBOARDING_CONVERSATION } from './conversation.js'

const composer = new Composer<Context>()

const feature = composer.chatType('private')

feature.command('start', logHandle('command-start'), async (ctx) => {
  if (isOnboardingComplete(ctx)) {
    await ctx.reply('Меню') // TODO: заменить на профиль меню
    return
  }

  await ctx.conversation.enter(ONBOARDING_CONVERSATION)
})

feature.command('onboarding', logHandle('command-onboarding'), async (ctx) => {
  await ctx.conversation.enter(ONBOARDING_CONVERSATION)
})

export { composer as onboardingFeature }
