import type { ValidationError } from 'class-validator'

import type { IStepFactory } from './onboarding.types.js'
import type { OnboardingState } from './onboarding-state.js'

import { OnboardingStatus } from './onboarding-state.js'

export class OnboardingService {
  private state: OnboardingState
  constructor(
    private readonly factory: IStepFactory,
    initialState?: OnboardingState,
  ) {
    this.state = initialState ?? {
      status: OnboardingStatus.Idle,
      current: 0,
      stepsData: [],
    }
  }

  public async process(input: string): Promise<void> {
    if (this.state.current >= this.factory.count()) {
      throw new Error('Onboarding already completed')
    }

    const step = this.factory.create(this.state.current, input)

    // Validate with focused try-catch for class-validator errors
    try {
      await step.validate()
    }
    catch (error) {
      const validationErrors = Array.isArray(error) ? error as ValidationError[] : []

      if (validationErrors.length > 0) {
        const firstError = validationErrors[0]
        const errorMessage = firstError.constraints
          ? String(Object.values(firstError.constraints)[0])
          : 'Validation error'

        throw new Error(errorMessage)
      }

      throw new Error('Validation error')
    }

    // Store step data
    this.state.stepsData.push(step.getData())

    // Move to next step
    this.next()
  }

  public setState(state: OnboardingState) {
    this.state = state
  }

  public currentIndex(): number {
    return this.state.current
  }

  public stateSnapshot(): OnboardingState {
    return {
      status: this.state.status,
      current: this.state.current,
      stepsData: this.state.stepsData.map(data => ({ ...data })),
    }
  }

  public get isCompleted(): boolean {
    return this.state.status === OnboardingStatus.Completed
  }

  public totalSteps(): number {
    return this.factory.count()
  }

  private async next(): Promise<void> {
    if (this.state.current + 1 >= this.factory.count()) {
      this.state.status = OnboardingStatus.Completed
    }
    else {
      this.state.current++
      this.state.status = OnboardingStatus.InProgress
    }
  }
}

export function createOnboardingService(factory: IStepFactory, initialState?: OnboardingState) {
  return new OnboardingService(factory, initialState)
}
