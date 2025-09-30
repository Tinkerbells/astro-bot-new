import type { Step } from '#root/application/onboarding-service/index.js'

import { TimezoneStep } from './timezone-step.js'
import { BirthDateStep } from './birth-date-step.js'
import { BirthTimeStep } from './birth-time-step.js'

export { BirthDateStep } from './birth-date-step.js'
export { BirthTimeStep } from './birth-time-step.js'
export { TimezoneStep } from './timezone-step.js'

// Массив фабрик шагов, соответствующий OnboardingStep enum
// Индекс массива = значение OnboardingStep
export const onboardingSteps: Array<(input: string) => Step<any>> = [
  (input: string) => new BirthDateStep(input), // OnboardingStep.BirthDate = 0
  (input: string) => new BirthTimeStep(input), // OnboardingStep.BirthTime = 1
  (input: string) => new TimezoneStep(input), // OnboardingStep.Timezone = 2
]
