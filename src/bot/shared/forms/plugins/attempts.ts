import type { Conversation } from '@grammyjs/conversations'

import type { Context } from '#root/bot/context.js'

import type { AttemptsSession } from '../session/attempts-session.js'
import type { FormBuildOptions, FormValidateResult } from './types.js'

import { FormStepPlugin } from './types.js'
import { getAttemptsSession } from '../session/attempts-session.js'

export type AttemptsState = {
  stepId: string
  attempts: number
}

type LimitHandler<TContext extends Context> = (
  ctx: TContext,
) => Promise<FormValidateResult<unknown>> | FormValidateResult<unknown>

/**
 * Плагин следит за количеством попыток ввода в пределах одного шага и позволяет
 * задать собственную реакцию, когда лимит достигнут. Состояние хранится в сессии
 * conversation, поэтому оно разделяет повторные входы в текущий шаг.
 */
export type AttemptsPluginOptions<TContext extends Context> = {
  maxAttempts?: number
  onLimitReached?: LimitHandler<TContext>
}

export class AttemptsPlugin<
  TContext extends Context = Context,
> extends FormStepPlugin<TContext, 'attempts'> {
  public readonly name = 'attempts' as const

  private stepId!: string
  private maxAttempts: number
  private limitHandler?: LimitHandler<TContext>
  private attemptsSession!: AttemptsSession

  /**
   * Создаёт и подготавливает плагин. Стандартный лимит — 3 попытки.
   */
  static async init<TContext extends Context>(
    _ctx: TContext,
    conversation: Conversation<TContext, TContext>,
    stepId: string,
  ): Promise<AttemptsPlugin<TContext>> {
    const instance = new AttemptsPlugin<TContext>()
    await instance.setup(_ctx, conversation, stepId)
    return instance
  }

  constructor(options?: AttemptsPluginOptions<TContext>) {
    super()
    this.maxAttempts = options?.maxAttempts ?? 3
    if (options?.onLimitReached) {
      this.limitHandler = options.onLimitReached
    }
  }

  public async setup(
    _ctx: TContext,
    conversation: Conversation<TContext, TContext>,
    stepId: string,
  ): Promise<void> {
    this.stepId = stepId
    this.attemptsSession = getAttemptsSession(conversation, stepId)
    await this.ensureState()
  }

  /**
   * Устанавливает максимально допустимое количество попыток.
   */
  public setMaxAttempts(maxAttempts: number): void {
    this.maxAttempts = maxAttempts
  }

  /**
   * Регистрирует обработчик, который вызывается при достижении лимита.
   */
  public setOnLimitReached<TResult>(
    handler: (
      ctx: TContext,
    ) => Promise<FormValidateResult<TResult>> | FormValidateResult<TResult>,
  ): void {
    this.limitHandler = handler as LimitHandler<TContext>
  }

  /**
   * Оборачивает валидацию формы, увеличивая счётчик попыток и применяя
   * пользовательский обработчик при превышении лимита.
   */
  public async wrapFormBuild<TResult>(
    options: FormBuildOptions<TContext, TResult>,
    next: (buildOptions: FormBuildOptions<TContext, TResult>) => Promise<TResult>,
  ): Promise<TResult> {
    const originalValidate = options.validate

    const wrapped: FormBuildOptions<TContext, TResult> = {
      ...options,
      validate: async (ctx: TContext) => {
        const currentState = await this.getState()
        const attemptsBefore = currentState?.stepId === this.stepId ? currentState.attempts : 0

        if (attemptsBefore >= this.maxAttempts) {
          const limit = await this.handleLimit<TResult>(ctx)
          if (limit.ok) {
            await this.reset()
          }
          return limit
        }

        const attempts = await this.increment()
        const result = await originalValidate(ctx)

        if (result.ok) {
          await this.reset()
          return result
        }

        if (attempts >= this.maxAttempts) {
          const limitResult = await this.handleLimit<TResult>(ctx)
          if (limitResult.ok) {
            await this.reset()
          }
          return limitResult
        }

        return result
      },
    }

    return next(wrapped)
  }

  /**
   * Очищает накопленные данные плагина из сессии.
   */
  public async cleanup(): Promise<void> {
    await this.reset()
  }

  /**
   * Гарантирует, что хранилище попыток инициализировано для текущего шага.
   */
  private async ensureState(): Promise<void> {
    const state = await this.getState()
    if (!state || state.stepId !== this.stepId) {
      await this.setState({
        stepId: this.stepId,
        attempts: 0,
      })
    }
  }

  private async getState(): Promise<AttemptsState | undefined> {
    return await this.attemptsSession.read()
  }

  private async setState(state: AttemptsState): Promise<void> {
    await this.attemptsSession.write(state)
  }

  /**
   * Сбрасывает состояние, если оно принадлежит текущему шагу.
   */
  private async reset(): Promise<void> {
    await this.attemptsSession.clear(this.stepId)
  }

  /**
   * Увеличивает счётчик попыток и возвращает актуальное значение.
   */
  private async increment(): Promise<number> {
    const state = await this.getState()
    if (state?.stepId === this.stepId) {
      const nextAttempts = state.attempts + 1
      await this.setState({
        stepId: this.stepId,
        attempts: nextAttempts,
      })
      return nextAttempts
    }

    await this.setState({
      stepId: this.stepId,
      attempts: 1,
    })

    return 1
  }

  private async handleLimit<TResult>(ctx: TContext): Promise<FormValidateResult<TResult>> {
    if (this.limitHandler) {
      return await this.limitHandler(ctx) as FormValidateResult<TResult>
    }

    return { ok: false, error: new Error('Attempt limit reached') }
  }
}
