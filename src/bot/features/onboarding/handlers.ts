import type { ReplyKeyboardRemove } from 'grammy/types'

import { Composer } from 'grammy'

import type { Context } from '#root/bot/context.js'

import { logHandle } from '#root/bot/shared/helpers/logging.js'

import type { TimezoneData } from './steps/timezone-step.js'

import { OnboardingStep } from './enums.js'
import { createCitiesKeyboard } from './keyboards.js'
import { onboardingMiddleware } from './middleware.js'
import { getTimezoneByCoordinates } from './utils/index.js'

const composer = new Composer<Context>()

const feature = composer.chatType('private')

feature.use(onboardingMiddleware)

const STEP_PROMPTS: Record<OnboardingStep, { translationKey: string, keyboard: 'remove' | 'cities' | null }> = {
  [OnboardingStep.BirthDate]: {
    translationKey: 'onboarding-birth-date',
    keyboard: 'remove',
  },
  [OnboardingStep.BirthTime]: {
    translationKey: 'onboarding-birth-time',
    keyboard: 'remove',
  },
  [OnboardingStep.Timezone]: {
    translationKey: 'onboarding-location',
    keyboard: 'cities',
  },
}

type SuccessMessage = {
  text: string
  replyMarkup?: ReplyKeyboardRemove
}

feature.command('start', logHandle('command-start'), async (ctx) => {
  if (ctx.onboarding.isCompleted) {
    await ctx.reply('Меню')
    return
  }

  await ctx.reply(ctx.t('onboarding-start'))
  await sendCurrentPrompt(ctx)
})

feature.command('onboarding', logHandle('command-onboarding'), async (ctx) => {
  ctx.onboarding.reset()
  await ctx.reply(ctx.t('onboarding-start'))
  await sendCurrentPrompt(ctx)
})

feature.on('message:text', async (ctx) => {
  const text = ctx.message?.text
  if (!text)
    return

  if (ctx.onboarding.currentIndex === OnboardingStep.Timezone && isManualTimezoneCommand(ctx, text)) {
    await ctx.reply(ctx.t('onboarding-timezone'), {
      reply_markup: { remove_keyboard: true as const },
    })
    return
  }

  try {
    const result = await ctx.onboarding.process(text)
    const success = buildSuccessMessage(ctx, result.step, result.data)

    if (success) {
      if (success.replyMarkup)
        await ctx.reply(success.text, { reply_markup: success.replyMarkup })
      else
        await ctx.reply(success.text)
    }

    if (ctx.onboarding.isCompleted) {
      await completeOnboarding(ctx)
      return
    }

    await sendCurrentPrompt(ctx)
  }
  catch (error) {
    const errorMessage = error instanceof Error ? error.message : ctx.t('onboarding-validation-error')
    await ctx.reply(errorMessage)
  }
})

feature.on('message:location', async (ctx) => {
  if (ctx.onboarding.currentIndex !== OnboardingStep.Timezone)
    return

  const location = ctx.message.location

  try {
    const timezone = getTimezoneByCoordinates(location.latitude, location.longitude)
    await ctx.onboarding.process(timezone)

    await ctx.reply(ctx.t('onboarding-location-saved-coordinates', { timezone }), {
      reply_markup: { remove_keyboard: true as const },
    })

    if (ctx.onboarding.isCompleted) {
      await completeOnboarding(ctx)
      return
    }

    await sendCurrentPrompt(ctx)
  }
  catch (error) {
    ctx.logger.error(error)
    await ctx.reply(ctx.t('onboarding-validation-error'))
  }
})

async function sendCurrentPrompt(ctx: Context): Promise<void> {
  const prompt = STEP_PROMPTS[ctx.onboarding.currentIndex]
  const text = ctx.t(prompt.translationKey)

  if (prompt.keyboard === 'cities') {
    await ctx.reply(text, { reply_markup: createCitiesKeyboard(ctx) })
    return
  }

  if (prompt.keyboard === 'remove') {
    await ctx.reply(text, { reply_markup: { remove_keyboard: true as const } })
    return
  }

  await ctx.reply(text)
}

async function completeOnboarding(ctx: Context): Promise<void> {
  const userId = ctx.session.user?.id
  if (!userId) {
    await ctx.reply(ctx.t('onboarding-validation-error'))
    return
  }

  try {
    const updatedUser = await ctx.onboarding.complete(userId)
    ctx.session.user = updatedUser

    await ctx.reply(ctx.t('onboarding-completed'), {
      reply_markup: { remove_keyboard: true as const },
    })
  }
  catch (error) {
    ctx.logger.error({ error }, 'Onboarding completion failed')
    await ctx.reply(ctx.t('onboarding-validation-error'))
  }
}

function buildSuccessMessage(ctx: Context, step: OnboardingStep, data?: Record<string, unknown>): SuccessMessage | undefined {
  if (step !== OnboardingStep.Timezone)
    return undefined

  const timezoneData = data as TimezoneData | undefined
  if (!timezoneData)
    return undefined

  if (timezoneData.city) {
    return {
      text: ctx.t('onboarding-location-saved', { city: timezoneData.city }),
      replyMarkup: { remove_keyboard: true as const },
    }
  }

  if (timezoneData.timezone) {
    return {
      text: ctx.t('onboarding-timezone-saved'),
      replyMarkup: { remove_keyboard: true as const },
    }
  }

  return undefined
}

function isManualTimezoneCommand(ctx: Context, text: string): boolean {
  return text === ctx.t('onboarding-location-custom')
}

export { composer as onboardingFeature }
