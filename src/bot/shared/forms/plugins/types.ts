import type { Conversation } from '@grammyjs/conversations'

import type { Context } from '#root/bot/context.js'

export type FormValidateResult<T> = { ok: false, error?: unknown } | { ok: true, value: T }

export type FormBuildOptions<
  TContext extends Context,
  TValue,
> = {
  validate: (ctx: TContext) => Promise<FormValidateResult<TValue>>
  otherwise?: (ctx: TContext) => Promise<void>
}

export abstract class FormStepPlugin<
  _TContext extends Context = Context,
  TName extends string = string,
  TConfig = undefined,
> {
  /**
   * Название плагина (уникальное)
   */
  public abstract readonly name: TName

  /**
   * Статический метод для создания и инициализации плагина.
   * Должен создать инстанс, выполнить всю необходимую инициализацию
   * (включая асинхронную) и вернуть готовый плагин.
   */
  public static init: <TContext extends Context>(
    ctx: TContext,
    conversation: Conversation<TContext, TContext>,
    stepId: string,
  ) => Promise<FormStepPlugin<TContext, string>> | FormStepPlugin<TContext, string>

  /**
   * Очистка ресурсов плагина (опциональный метод)
   */
  public cleanup?(): void | Promise<void>

  /**
   * Позволяет плагину обернуть вызов формы (conversation.form.build)
   */
  public wrapFormBuild?<
    TValue,
  >(
    options: FormBuildOptions<_TContext, TValue>,
    next: (options: FormBuildOptions<_TContext, TValue>) => Promise<TValue>,
    config?: TConfig extends undefined ? undefined : TConfig,
  ): Promise<TValue>

  /**
   * Дополнительный этап инициализации для заранее созданных инстансов плагинов.
   */
  public setup?(
    ctx: _TContext,
    conversation: Conversation<_TContext, _TContext>,
    stepId: string,
  ): Promise<void> | void
}
