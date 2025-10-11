import { InlineKeyboard } from 'grammy'

import type { Context } from '#root/bot/context.js'

import { FormStepPlugin } from './types.js'

export type SkipPluginOptions = {
  /**
   * Текст кнопки skip (по умолчанию 'Skip')
   */
  text?: string
  /**
   * Callback data для кнопки skip (по умолчанию 'skip')
   */
  callbackData?: string
}

export class SkipPlugin<
  TContext extends Context = Context,
> extends FormStepPlugin<TContext, 'skip'> {
  public readonly name = 'skip' as const

  private text: string
  private callbackData: string

  /**
   * Статический метод для создания и инициализации плагина
   */
  static init<TContext extends Context>(
  ): SkipPlugin<TContext> {
    const instance = new SkipPlugin<TContext>()
    instance.text = 'Skip'
    instance.callbackData = 'skip'
    return instance
  }

  private constructor() {
    super()
  }

  /**
   * Создаёт клавиатуру со skip кнопкой
   */
  public createKeyboard(): InlineKeyboard {
    return new InlineKeyboard().text(this.text, this.callbackData)
  }

  /**
   * Проверяет, нажата ли кнопка skip в текущем контексте
   */
  public async skip(ctx: TContext, callback: () => void) {
    if (ctx.callbackQuery) {
      await ctx.answerCallbackQuery()
    }
    if (ctx.callbackQuery?.data === this.callbackData) {
      callback()
    }
  }
}
