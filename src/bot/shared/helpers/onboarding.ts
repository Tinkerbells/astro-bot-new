import type { Context } from '#root/bot/context.js'

import { OnboardingStatus } from '../types/onboarding.types.js'

export function isOnboardingComplete(ctx: Context): boolean {
  return ctx.session.onboarding.status === OnboardingStatus.Completed
}

export function updateOnboardingStatus(ctx: Context, status: OnboardingStatus): void {
  ctx.session.onboarding.status = status
}
