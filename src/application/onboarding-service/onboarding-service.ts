import type { PersistStorage } from '#root/shared/index.js'

import type { OnboardingState } from './onboarding.types.js'

import { OnboardingStatus } from './onboarding.types.js'

export class OnboardingService {
  private state: OnboardingState

  constructor(
    initialState: OnboardingState,
    private readonly persistStorage?: PersistStorage,
    private readonly onComplete?: (state: OnboardingState) => Promise<void> | void,
  ) {
    this.state = initialState
  }

  public setState(state: OnboardingState) {
    this.state = state
    this.persistStorage?.setObject('onboarding', this.state)
  }

  public get currentIndex(): number {
    return this.state.current
  }

  public stateSnapshot(): OnboardingState {
    return {
      status: this.state.status,
      current: this.state.current,
      totalSteps: this.state.totalSteps,
      stepsData: this.state.stepsData.map(data => ({ ...data })),
    }
  }

  public get isCompleted(): boolean {
    return this.state.status === OnboardingStatus.Completed
  }

  public async next(stepData: Record<string, unknown>): Promise<boolean> {
    if (this.isCompleted) {
      throw new Error('Onboarding already completed')
    }

    this.state.stepsData.push(stepData)

    const isLastStep = this.state.current + 1 >= this.state.totalSteps

    if (isLastStep) {
      this.state.current = this.state.totalSteps
      this.state.status = OnboardingStatus.Completed
      this.persistStorage?.setObject('onboarding', this.state)
      if (this.onComplete)
        await this.onComplete(this.state)
      return false
    }

    this.state.current++
    this.state.status = OnboardingStatus.InProgress
    this.persistStorage?.setObject('onboarding', this.state)
    return true
  }

  public reset() {
    this.state.status = OnboardingStatus.Idle
    this.state.current = 0
    this.state.stepsData = []
    this.persistStorage?.setObject('onboarding', this.state)
  }
}

export function createOnboardingService(initialState: OnboardingState, persistStorage?: PersistStorage, onComplete?: (state: OnboardingState) => Promise<void> | void) {
  return new OnboardingService(initialState, persistStorage, onComplete)
}
