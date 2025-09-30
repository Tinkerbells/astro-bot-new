import { validateOrReject } from 'class-validator'

export abstract class Step<T extends object> {
  constructor(protected readonly data: T) { }
  public async validate(): Promise<void> {
    await validateOrReject(this)
  }

  getData(): T {
    return this.data
  }
}

export type IStepFactory = {
  create: (index: number, input: string) => Step<any>
  count: () => number
}
