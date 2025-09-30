import type { NextFunction } from 'grammy'

import type { Context } from '#root/bot/context.js'

import { StepFactory } from '#root/application/onboarding-service/index.js'

import { OnboardingFlow } from './onboarding-flow/index.js'
import { BirthDateStep, BirthTimeStep, TimezoneStep } from './steps/index.js'

// Фабрика со всеми шагами онбординга
const steps = [BirthDateStep, BirthTimeStep, TimezoneStep]
const factory = new StepFactory(steps)

/**
 * Middleware для инициализации ctx.onboarding
 * Добавляет OnboardingFlow в контекст каждого запроса
 */
export async function onboardingMiddleware(ctx: Context, next: NextFunction): Promise<void> {
  ctx.onboarding = new OnboardingFlow(
    factory,
    ctx.session.onboarding,
    (state) => {
      ctx.session.onboarding = state
    },
  )

  await next()
}
