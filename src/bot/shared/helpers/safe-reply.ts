import type { Message } from 'grammy/types'
import type { Other } from '@grammyjs/hydrate'

import type { Context } from '#root/bot/context.js'

import { safeAsync } from '#root/shared/safe-async/safe-async.js'

export function safeReply(ctx: Context) {
  return async (
    text: string,
    other?: Other<'sendMessage', 'chat_id' | 'text'>,
    errorMessage?: string,
  ): Promise<Message.TextMessage | null> => {
    if (!errorMessage) {
      errorMessage = ctx.t('errors-something-went-wrong')
    }
    const [error, sentMessage] = await safeAsync(ctx.reply(text, other))

    if (error) {
      ctx.logger.error({ error }, errorMessage)
      const [, fallbackMessage] = await safeAsync(ctx.reply(errorMessage))
      return fallbackMessage
    }

    return sentMessage
  }
}

/**
 * Безопасная обёртка над `ctx.reply`, предотвращающая выброс ошибок и
 * логирующая возможные проблемы при отправке сообщения.
 *
 * 💡 Рекомендуется использовать вместо прямого вызова `ctx.reply`, особенно
 * когда передаётся сложный объект `reply_markup` (inline-клавиатуры,
 * кастомные кнопки и т. п.), чтобы избежать падения бота при ошибках Telegram API.
 *
 * Если при отправке сообщения произойдёт ошибка, функция залогирует её
 * через `ctx.logger.error` и попытается отправить fallback-сообщение
 * (по умолчанию текст локализованной ошибки `errors-something-went-wrong`).
 *
 * @param {Context} ctx - Контекст Grammy, передаваемый в хэндлер.
 * @returns {(text: string, other?: Other<'sendMessage', 'chat_id' | 'text'>, errorMessage?: string) => Promise<Message.TextMessage | null>}
 * Функция для безопасной отправки сообщений, возвращающая отправленное сообщение или `null` при ошибке.
 *
 * @example
 * const reply = safeReply(ctx)
 * await reply('Выберите вариант:', {
 *   reply_markup: {
 *     inline_keyboard: [
 *       [{ text: 'Да', callback_data: 'yes' }],
 *       [{ text: 'Нет', callback_data: 'no' }],
 *     ],
 *   },
 * })
 */
export type SafeReply = ReturnType<typeof safeReply>
