export enum OnboardingStatus {
  Idle = 0,
  InProgress = 1,
  Completed = 2,
}

export type OnboardingState = {
  totalSteps: number
  status: OnboardingStatus
  current: number
  stepsData: Record<string, unknown>[]
}
