import type { Conversation } from '@grammyjs/conversations'

import type { Context } from '#root/bot/context.js'

import { FormStepPlugin } from './types.js'

export type FormState = {
  stepId: string
  attempts: number
}

export class AttemptsPlugin<
  TContext extends Context = Context,
> extends FormStepPlugin<TContext, 'attempts'> {
  public readonly name = 'attempts' as const

  private conversation: Conversation<TContext, TContext>
  private stepId: string

  /**
   * Статический метод для создания и инициализации плагина
   */
  static async init<TContext extends Context>(
    ctx: TContext,
    conversation: Conversation<TContext, TContext>,
    stepId: string,
  ): Promise<AttemptsPlugin<TContext>> {
    const instance = new AttemptsPlugin<TContext>()
    instance.conversation = conversation
    instance.stepId = stepId

    // Инициализируем formState если его нет
    const formState = await instance.getFormState()
    if (!formState || formState.stepId !== stepId) {
      await instance.setFormState({
        stepId,
        attempts: 0,
      })
    }

    return instance
  }

  private constructor() {
    super()
  }

  private async getFormState(): Promise<FormState | undefined> {
    return await this.conversation.external(ctx => ctx.session.__formState)
  }

  private async setFormState(state: FormState): Promise<void> {
    await this.conversation.external((ctx) => {
      ctx.session.__formState = state
    })
  }

  public async get(): Promise<number> {
    const formState = await this.getFormState()
    return formState?.stepId === this.stepId ? formState.attempts : 0
  }

  public async increment(): Promise<number> {
    const formState = await this.getFormState()
    if (formState?.stepId === this.stepId) {
      const newAttempts = formState.attempts + 1
      await this.setFormState({
        stepId: this.stepId,
        attempts: newAttempts,
      })
      return newAttempts
    }
    return 0
  }

  public async cleanup(): Promise<void> {
    const formState = await this.getFormState()
    if (formState?.stepId === this.stepId) {
      await this.conversation.external((ctx) => {
        delete ctx.session.__formState
      })
    }
  }
}
