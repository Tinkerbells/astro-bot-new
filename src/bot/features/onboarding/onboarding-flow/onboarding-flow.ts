import type { User } from '#root/domain/entities/user/user.js'
import type { IStepFactory, OnboardingState } from '#root/application/onboarding-service/index.js'

import { userRepository } from '#root/data/repositories/user-repository/index.js'
import { OnboardingService, OnboardingStatus } from '#root/application/onboarding-service/index.js'

import type { TimezoneData } from '../steps/timezone-step.js'
import type { BirthDateData } from '../steps/birth-date-step.js'
import type { BirthTimeData } from '../steps/birth-time-step.js'

import { OnboardingStep } from '../enums.js'
import { buildBirthDateTimeISO, normalizeBirthDateInput } from '../utils/index.js'

type ProcessResult = {
  step: OnboardingStep
  data?: Record<string, unknown>
}

export class OnboardingFlow {
  private service: OnboardingService

  constructor(
    private readonly factory: IStepFactory,
    initialState: OnboardingState,
    private readonly saveState: (state: OnboardingState) => void,
  ) {
    this.service = new OnboardingService(factory, initialState)
  }

  public get currentIndex(): OnboardingStep {
    return this.service.currentIndex() as OnboardingStep
  }

  public get isCompleted(): boolean {
    return this.service.isCompleted
  }

  public get totalSteps(): number {
    return this.service.totalSteps()
  }

  public reset(): void {
    this.service = new OnboardingService(this.factory)
    this.persist()
  }

  public async process(input: string): Promise<ProcessResult> {
    const stepIndex = this.service.currentIndex()
    await this.service.process(input)
    const state = this.persist()

    return {
      step: stepIndex as OnboardingStep,
      data: state.stepsData[stepIndex],
    }
  }

  public getStepData<T>(step: OnboardingStep): T | undefined {
    const state = this.service.stateSnapshot()
    return state.stepsData[step] as T | undefined
  }

  public async complete(userId: string): Promise<User> {
    const { birthDateData, birthTimeData, timezoneData } = this.getRequiredData()

    const normalizedBirthDate = normalizeBirthDateInput(birthDateData.birthDate)
    if (!normalizedBirthDate)
      throw new Error('Invalid birth date data')

    const birthDateTime = buildBirthDateTimeISO(
      normalizedBirthDate,
      birthTimeData.birthTime,
      timezoneData.timezone,
    )

    if (!birthDateTime)
      throw new Error('Unable to build birth datetime')

    const updatedUser = await userRepository.update({
      id: userId,
      birthDateTime,
      timezone: timezoneData.timezone,
    })

    this.markCompleted()

    return updatedUser
  }

  private getRequiredData(): {
    birthDateData: BirthDateData
    birthTimeData: BirthTimeData
    timezoneData: TimezoneData
  } {
    const birthDateData = this.getStepData<BirthDateData>(OnboardingStep.BirthDate)
    const birthTimeData = this.getStepData<BirthTimeData>(OnboardingStep.BirthTime)
    const timezoneData = this.getStepData<TimezoneData>(OnboardingStep.Timezone)

    if (!birthDateData?.birthDate || !birthTimeData?.birthTime || !timezoneData?.timezone)
      throw new Error('Missing required onboarding data')

    return { birthDateData, birthTimeData, timezoneData }
  }

  private persist(): OnboardingState {
    const state = this.service.stateSnapshot()
    this.saveState(state)
    return state
  }

  private markCompleted(): void {
    const state = this.service.stateSnapshot()
    state.status = OnboardingStatus.Completed
    this.service.setState(state)
    this.persist()
  }
}
