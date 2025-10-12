import type { Conversation } from '@grammyjs/conversations'

import { InlineKeyboard } from 'grammy'

import type { Context } from '#root/bot/context.js'

import type { FormBuildOptions, FormValidateResult } from './types.js'

import { FormStepPlugin } from './types.js'

type SkipResultFactory<TContext extends Context> = (
  ctx: TContext,
) => Promise<FormValidateResult<unknown>> | FormValidateResult<unknown>

type SkipResultSource<TContext extends Context> =
  | FormValidateResult<unknown>
  | ((ctx: TContext) => Promise<FormValidateResult<unknown>> | FormValidateResult<unknown>)

export type SkipPluginOptions<TContext extends Context> = {
  text?: string
  callbackData?: string
  skipResult?: SkipResultSource<TContext>
}

/**
 * Плагин добавляет поддержку «пропуска» шага формы через inline‑кнопку и
 * позволяет задать значение, которое вернётся при выборе пропуска.
 */
export class SkipPlugin<
  TContext extends Context = Context,
> extends FormStepPlugin<TContext, 'skip'> {
  public readonly name = 'skip' as const

  private text = 'Skip'
  private callbackData = 'skip'
  private skipResultFactory?: SkipResultFactory<TContext>

  /**
   * Создаёт плагин. Параметры hook не требуются, но соблюдаем сигнатуру init.
   */
  static init<TContext extends Context>(
    _ctx: TContext,
    _conversation: Conversation<TContext, TContext>,
    _stepId: string,
  ): SkipPlugin<TContext> {
    return new SkipPlugin<TContext>()
  }

  constructor(options?: SkipPluginOptions<TContext>) {
    super()
    if (options?.text) {
      this.text = options.text
    }
    if (options?.callbackData) {
      this.callbackData = options.callbackData
    }
    if (options?.skipResult) {
      this.setSkipResult(options.skipResult)
    }
  }

  /**
   * Позволяет сменить текст и callback data кнопки (например, для i18n).
   */
  public setButton(text: string, callbackData?: string): void {
    this.text = text
    if (callbackData) {
      this.callbackData = callbackData
    }
  }

  /**
   * Определяет, какой результат вернётся при нажатии на кнопку Skip.
   */
  public setSkipResult(result: SkipResultSource<TContext>): void {
    if (typeof result === 'function') {
      this.skipResultFactory = result as SkipResultFactory<TContext>
      return
    }

    const staticResult = result
    this.skipResultFactory = async () => staticResult
  }

  /**
   * Формирует клавиатуру с единственной кнопкой пропуска.
   */
  public createKeyboard(): InlineKeyboard {
    return new InlineKeyboard().text(this.text, this.callbackData)
  }

  /**
   * Перехватывает валидацию шага и возвращает заранее заданный результат,
   * если пользователь нажал кнопку skip.
   */
  public async wrapFormBuild<TResult>(
    options: FormBuildOptions<TContext, TResult>,
    next: (buildOptions: FormBuildOptions<TContext, TResult>) => Promise<TResult>,
  ): Promise<TResult> {
    const originalValidate = options.validate

    const wrapped = {
      ...options,
      validate: async (ctx: TContext) => {
        if (ctx.callbackQuery?.data === this.callbackData) {
          await ctx.answerCallbackQuery()
          const resultFactory = this.skipResultFactory

          if (resultFactory) {
            return await resultFactory(ctx) as FormValidateResult<TResult>
          }

          return { ok: true, value: undefined as TResult }
        }

        return originalValidate(ctx)
      },
    }

    return next(wrapped)
  }
}
