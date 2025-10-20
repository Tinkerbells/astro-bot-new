import type { Message } from 'grammy/types'
import type { Other } from '@grammyjs/hydrate'

import type { Context } from '#root/bot/context.js'

import { safeAsync } from '#root/shared/safe-async/safe-async.js'

/**
 * Безопасная отправка сообщения с Markdown форматированием.
 * Пытается отправить сообщение последовательно с форматами:
 * MarkdownV2 → Markdown → plain text
 *
 * @param {Context} ctx - Контекст Grammy
 * @returns Функция для безопасной отправки Markdown сообщений
 *
 * @example
 * const replyMarkdown = safeReplyMarkdown(ctx)
 * await replyMarkdown('**Жирный** текст')
 */
export function safeReplyMarkdown(ctx: Context) {
  return async (
    text: string,
    other?: Other<'sendMessage', 'chat_id' | 'text'>,
  ): Promise<Message.TextMessage | null> => {
    // Попытка 1: MarkdownV2
    const [mdv2Error, mdv2Message] = await safeAsync(
      ctx.reply(text, { ...other, parse_mode: 'MarkdownV2' }),
    )

    if (!mdv2Error && mdv2Message) {
      return mdv2Message as Message.TextMessage
    }

    ctx.logger.warn(
      { err: mdv2Error },
      'Failed with MarkdownV2, trying Markdown',
    )

    // Попытка 2: Markdown
    const [mdError, mdMessage] = await safeAsync(
      ctx.reply(text, { ...other, parse_mode: 'Markdown' }),
    )

    if (!mdError && mdMessage) {
      return mdMessage as Message.TextMessage
    }

    ctx.logger.warn(
      { err: mdError },
      'Failed with Markdown, falling back to plain text',
    )

    // Попытка 3: Plain text
    const [plainError, plainMessage] = await safeAsync(
      ctx.reply(text, other),
    )

    if (plainError) {
      ctx.logger.error(
        { err: plainError },
        'Failed to send message even as plain text',
      )
      return null
    }

    return plainMessage as Message.TextMessage
  }
}

/**
 * Безопасное редактирование сообщения с Markdown форматированием.
 * Пытается отредактировать сообщение последовательно с форматами:
 * MarkdownV2 → Markdown → plain text
 *
 * @param {Context} ctx - Контекст Grammy
 * @returns Функция для безопасного редактирования Markdown сообщений
 *
 * @example
 * const editMarkdown = safeEditMarkdownMessage(ctx)
 * await editMarkdown('**Обновленный** текст')
 */
export function safeEditMarkdownMessage(ctx: Context) {
  return async (
    text: string,
    other?: Other<'editMessageText', 'chat_id' | 'message_id' | 'inline_message_id' | 'text'>,
  ): Promise<Message.TextMessage | true | null> => {
    // Попытка 1: MarkdownV2
    const [mdv2Error, mdv2Message] = await safeAsync(
      ctx.editMessageText(text, { ...other, parse_mode: 'MarkdownV2' }),
    )

    if (!mdv2Error && mdv2Message) {
      return mdv2Message
    }

    ctx.logger.warn(
      { err: mdv2Error },
      'Failed to edit with MarkdownV2, trying Markdown',
    )

    // Попытка 2: Markdown
    const [mdError, mdMessage] = await safeAsync(
      ctx.editMessageText(text, { ...other, parse_mode: 'Markdown' }),
    )

    if (!mdError && mdMessage) {
      return mdMessage
    }

    ctx.logger.warn(
      { err: mdError },
      'Failed to edit with Markdown, falling back to plain text',
    )

    // Попытка 3: Plain text
    const [plainError, plainMessage] = await safeAsync(
      ctx.editMessageText(text, other),
    )

    if (plainError) {
      ctx.logger.error(
        { err: plainError },
        'Failed to edit message even as plain text',
      )
      return null
    }

    return plainMessage
  }
}

export type SafeReplyMarkdown = ReturnType<typeof safeReplyMarkdown>
export type SafeEditMarkdownMessage = ReturnType<typeof safeEditMarkdownMessage>
