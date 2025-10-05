import { Composer } from 'grammy'
import { createConversation } from '@grammyjs/conversations'

import type { Context } from '#root/bot/context.js'

import { logHandle } from '#root/bot/shared/helpers/logging.js'

import { onboarding, ONBOARDING_CONVERSATION } from './conversation.js'

const composer = new Composer<Context>()

const feature = composer.chatType('private')

// Регистрируем conversation
// @ts-expect-error - Type mismatch between grammy Context types is a known issue
feature.use(createConversation(onboarding, ONBOARDING_CONVERSATION))

// Обработчик команды /start
feature.command('start', logHandle('command-start'), async (ctx) => {
  // Проверяем, завершен ли онбординг по данным пользователя
  const user = ctx.session.user
  const isOnboardingCompleted = !!(
    user.birthDate
    && user.timezone
  )

  if (isOnboardingCompleted) {
    await ctx.reply('Меню') // TODO: заменить на профиль меню
    return
  }

  await ctx.conversation.enter(ONBOARDING_CONVERSATION)
})

// Обработчик команды /onboarding для повторного прохождения
feature.command('onboarding', logHandle('command-onboarding'), async (ctx) => {
  await ctx.conversation.enter(ONBOARDING_CONVERSATION)
})

export { composer as onboardingFeature }
