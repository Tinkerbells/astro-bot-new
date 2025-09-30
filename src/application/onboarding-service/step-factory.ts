import type { IStepFactory, Step } from './onboarding.types.js'

type StepInstance = new (input: string) => Step<any>

export class StepFactory implements IStepFactory {
  constructor(private readonly steps: StepInstance[]) { }

  public create(index: number, input: string): Step<any> {
    const StepCtor = this.steps[index]
    if (!StepCtor) {
      throw new Error(`No step registered at index ${index}`)
    }
    return new StepCtor(input)
  }

  public count(): number {
    return this.steps.length
  }
}
