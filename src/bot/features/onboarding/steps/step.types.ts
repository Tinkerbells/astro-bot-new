import type { Context } from '#root/bot/context.js'

export type OnboardingStep<T> = {
  init: (input: string) => void
  message: (ctx: Context) => Promise<any>
  validate: (ctx: Context) => Promise<any>
  skip: (() => void) | null
  data: T
}

export enum OnboardingSteps {
  BirthDate = 0,
  BirthTime = 1,
  Timezone = 2,
}
