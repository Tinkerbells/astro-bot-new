import { Composer } from 'grammy'

import type { Context } from '#root/bot/context.js'

import { logHandle } from '#root/bot/shared/helpers/logging.js'

import { onboardingMiddleware } from './middleware.js'
import { POPULAR_RUSSIAN_CITIES } from './constants.js'
import { getTimezoneByCoordinates } from './utils/index.js'
import { BirthDateStep, BirthTimeStep, OnboardingSteps, TimezoneStep } from './steps/index.js'

const composer = new Composer<Context>()

const feature = composer.chatType('private')

feature.use(onboardingMiddleware)

const steps = [
  new BirthDateStep(),
  new BirthTimeStep(),
  new TimezoneStep(),
]

function isSkipInput(ctx: Context, value: string): boolean {
  const normalized = value.trim().toLowerCase()
  const localizedSkip = ctx.t('onboarding-skip').trim().toLowerCase()
  return normalized === localizedSkip
    || normalized === '/skip'
    || normalized === 'skip'
}

feature.command('start', logHandle('command-start'), async (ctx) => {
  if (ctx.onboarding.isCompleted) {
    await ctx.reply('Меню')
    return
  }

  await ctx.reply(ctx.t('onboarding-start'))
  await steps[ctx.onboarding.currentIndex].message(ctx)
})

feature.command('onboarding', logHandle('command-onboarding'), async (ctx) => {
  ctx.onboarding.reset()
  await ctx.reply(ctx.t('onboarding-start'))
  await steps[ctx.onboarding.currentIndex].message(ctx)
})

feature.on('message:text', async (ctx) => {
  const text = ctx.message?.text
  if (!text)
    return

  if (ctx.onboarding.isCompleted)
    return

  const step = steps[ctx.onboarding.currentIndex]

  if (step instanceof BirthTimeStep && isSkipInput(ctx, text)) {
    step.skip()

    const hasNextAfterSkip = await ctx.onboarding.next(step.data)

    if (!hasNextAfterSkip)
      return

    await steps[ctx.onboarding.currentIndex].message(ctx)
    return
  }

  step.init(text)

  await step.validate(ctx)

  const hasNextStep = await ctx.onboarding.next(step.data)

  if (!hasNextStep)
    return

  await steps[ctx.onboarding.currentIndex].message(ctx)
})

feature.on('message:location', async (ctx) => {
  if (ctx.onboarding.currentIndex !== OnboardingSteps.Timezone)
    return

  const location = ctx.message.location

  const step = steps[ctx.onboarding.currentIndex]

  const timezone = getTimezoneByCoordinates(location.latitude, location.longitude)

  step.init(timezone)

  await step.validate(ctx)

  const hasNextStep = await ctx.onboarding.next(step.data)

  if (!hasNextStep)
    return

  await steps[ctx.onboarding.currentIndex].message(ctx)
})

feature.callbackQuery('onboarding:birth-time:skip', async (ctx) => {
  if (ctx.onboarding.isCompleted) {
    await ctx.answerCallbackQuery()
    return
  }

  if (ctx.onboarding.currentIndex !== OnboardingSteps.BirthTime) {
    await ctx.answerCallbackQuery()
    return
  }

  const step = steps[OnboardingSteps.BirthTime] as BirthTimeStep
  step.skip()

  try {
    await ctx.editMessageReplyMarkup()
  }
  catch (error) {
    ctx.logger.debug({ error }, 'Failed to remove birth time inline keyboard after skip')
  }

  await ctx.answerCallbackQuery()

  const hasNextStep = await ctx.onboarding.next(step.data)

  if (!hasNextStep)
    return

  await steps[ctx.onboarding.currentIndex].message(ctx)
})

feature.callbackQuery(/^onboarding:timezone:city:(\d+)$/, async (ctx) => {
  if (ctx.onboarding.isCompleted) {
    await ctx.answerCallbackQuery()
    return
  }

  const index = Number.parseInt(ctx.match![1], 10)
  const cityData = POPULAR_RUSSIAN_CITIES[index]

  if (!cityData) {
    await ctx.answerCallbackQuery({ text: ctx.t('onboarding-location-not-found'), show_alert: true })
    return
  }

  const step = steps[OnboardingSteps.Timezone] as TimezoneStep

  step.setCity(cityData)

  try {
    await step.validate(ctx)
  }
  catch (error) {
    ctx.logger.error({ error }, 'Timezone validation failed for inline city selection')
    await ctx.answerCallbackQuery({ text: ctx.t('onboarding-timezone-invalid'), show_alert: true })
    return
  }

  try {
    await ctx.editMessageReplyMarkup()
  }
  catch (error) {
    ctx.logger.debug({ error }, 'Failed to edit inline keyboard after city selection')
  }

  await ctx.answerCallbackQuery({ text: ctx.t('onboarding-location-saved', { city: cityData.city }) })

  const hasNextStep = await ctx.onboarding.next(step.data)

  if (!hasNextStep)
    return

  await steps[ctx.onboarding.currentIndex].message(ctx)
})
export { composer as onboardingFeature }
