import type { NextFunction } from 'grammy'

import type { Context } from '#root/bot/context.js'
import type { OnboardingState } from '#root/application/onboarding-service/index.js'

import { SessionPersistService } from '#root/bot/shared/services/session-persist-storage.js'
import { OnboardingService } from '#root/application/onboarding-service/onboarding-service.js'

import { completeOnboarding } from './utils/onboarding-completion.js'

/**
 * Middleware для инициализации ctx.onboarding
 * Добавляет OnboardingService в контекст каждого запроса
 */
export async function onboardingMiddleware(ctx: Context, next: NextFunction): Promise<void> {
  const persistService = new SessionPersistService(ctx)
  const onComplete = async (_state: OnboardingState) => {
    try {
      await completeOnboarding(ctx)
    }
    catch (error) {
      ctx.logger.error({ error }, 'Onboarding completion failed')
      await ctx.reply(ctx.t('onboarding-validation-error'))
    }
  }

  ctx.onboarding = new OnboardingService(ctx.session.onboarding, persistService, onComplete)
  await next()
}
