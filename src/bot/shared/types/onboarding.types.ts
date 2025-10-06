export enum OnboardingStatus {
  Idle = 0,
  InProgress = 1,
  Completed = 2,
}

export type OnboardingState = {
  status: OnboardingStatus
}
