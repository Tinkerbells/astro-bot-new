import type { Context } from '#root/bot/context.js'

import { profileMenu } from '../menu.js'

/**
 * Создает билдер для формирования profile сообщений
 */
export function createProfileMessage(ctx: Context) {
  const fullMessage = 'Меню'

  return {
    /**
     * Отправляет сообщение с профилем и меню
     */
    async send() {
      await ctx.reply(fullMessage, {
        reply_markup: profileMenu,
      })
    },

    /**
     * Отправляет сообщение с профилем без меню
     */
    async sendWithoutMenu() {
      await ctx.reply(fullMessage)
    },

    /**
     * Редактирует существующее сообщение
     */
    async edit() {
      await ctx.editMessageText(fullMessage, {
        reply_markup: profileMenu,
      })
    },

    /**
     * Редактирует существующее сообщение без меню
     */
    async editWithoutMenu() {
      await ctx.editMessageText(fullMessage)
    },

    /**
     * Возвращает полный текст сообщения
     */
    getText() {
      return fullMessage
    },
  }
}
