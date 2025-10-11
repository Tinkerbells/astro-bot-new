import type { Conversation } from '@grammyjs/conversations'

import type { Context } from '#root/bot/context.js'

export abstract class FormStepPlugin<
  _TContext extends Context = Context,
  TName extends string = string,
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
  public cleanup?(): void
}
