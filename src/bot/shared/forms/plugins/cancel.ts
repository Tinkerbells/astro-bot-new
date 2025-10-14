import type { Conversation } from '@grammyjs/conversations'

import { InlineKeyboard } from 'grammy'

import type { Context } from '#root/bot/context.js'

import type { FormBuildOptions } from './types.js'

import { FormStepPlugin } from './types.js'

type CancelHandler<TContext extends Context> = (ctx: TContext) => Promise<void> | void

export type CancelPluginOptions<TContext extends Context = Context> = {
  text?: string
  callbackData?: string
  conversationId?: string
  onCancel?: CancelHandler<TContext>
}

/**
 * Плагин добавляет поддержку «отмены» шага формы через inline‑кнопку и
 * завершает текущий conversation.
 */
export class CancelPlugin<
  TContext extends Context = Context,
> extends FormStepPlugin<TContext, 'cancel'> {
  public readonly name = 'cancel' as const

  private text = 'Cancel'
  private callbackData = 'cancel'
  private conversationId?: string
  private conversation?: Conversation<TContext, TContext>
  private onCancel?: CancelHandler<TContext>

  constructor(options?: CancelPluginOptions<TContext>) {
    super()
    if (options?.text) {
      this.text = options.text
    }
    if (options?.callbackData) {
      this.callbackData = options.callbackData
    }
    if (options?.conversationId) {
      this.conversationId = options.conversationId
    }
    if (options?.onCancel) {
      this.onCancel = options.onCancel
    }
  }

  public async setup(
    _ctx: TContext,
    conversation: Conversation<TContext, TContext>,
  ): Promise<void> {
    this.conversation = conversation
  }

  public async cleanup(): Promise<void> {
    this.conversation = undefined
    this.onCancel = undefined
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
   * Устанавливает идентификатор conversation, который нужно завершить.
   */
  public setConversationId(conversationId: string): void {
    this.conversationId = conversationId
  }

  public setOnCancel(handler?: CancelHandler<TContext>): void {
    this.onCancel = handler
  }

  /**
   * Формирует клавиатуру с единственной кнопкой отмены.
   */
  public createKeyboard(): InlineKeyboard {
    return new InlineKeyboard().text(this.text, this.callbackData)
  }

  private ensureConversationId(): string {
    if (!this.conversationId) {
      throw new Error('CancelPlugin: conversationId is not set')
    }
    return this.conversationId
  }

  private ensureConversation(): Conversation<TContext, TContext> {
    if (!this.conversation) {
      throw new Error('CancelPlugin: conversation handle is not available')
    }
    return this.conversation
  }

  private async handleCancel(ctx: TContext): Promise<never> {
    const conversationId = this.ensureConversationId()
    const conversation = this.ensureConversation()

    await ctx.answerCallbackQuery()
    await conversation.external(async (externalCtx) => {
      await externalCtx.conversation.exit(conversationId)
      if (this.onCancel) {
        await this.onCancel(externalCtx)
      }
    })

    return conversation.halt()
  }

  /**
   * Перехватывает валидацию шага и завершает conversation,
   * если пользователь нажал кнопку cancel.
   */
  public async wrapFormBuild<TValue>(
    options: FormBuildOptions<TContext, TValue>,
    next: (buildOptions: FormBuildOptions<TContext, TValue>) => Promise<TValue>,
  ): Promise<TValue> {
    const originalValidate = options.validate

    const wrapped = {
      ...options,
      validate: async (ctx: TContext) => {
        if (ctx.callbackQuery?.data === this.callbackData) {
          await this.handleCancel(ctx)
        }

        return originalValidate(ctx)
      },
    }

    return next(wrapped)
  }
}
