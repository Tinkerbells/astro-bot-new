import type { Context } from '#root/bot/context.js'

import { profileMenu } from '../menu.js'
import { MenuId } from '../../menu-ids.js'

export const PROFILE_MENU_TEXT_KEY = 'profile-menu-title'

/**
 * Создает билдер для формирования profile сообщений
 */
export function createProfileMessage(ctx: Context) {
  const textKey = PROFILE_MENU_TEXT_KEY
  const getFullMessage = () => ctx.t(textKey)

  return {
    /**
     * Отправляет сообщение с профилем и меню
     */
    async send() {
      return ctx.menuManager.replyWithMenu({
        menuKey: MenuId.Profile,
        textKey,
        replyMarkup: profileMenu,
      })
    },

    /**
     * Отправляет сообщение с профилем без меню
     */
    async sendWithoutMenu() {
      await ctx.reply(getFullMessage())
    },

    /**
     * Редактирует существующее сообщение
     */
    async edit() {
      await ctx.editMessageText(getFullMessage(), {
        reply_markup: profileMenu,
      })
    },

    /**
     * Редактирует существующее сообщение без меню
     */
    async editWithoutMenu() {
      await ctx.editMessageText(getFullMessage())
    },

    /**
     * Возвращает полный текст сообщения
     */
    getText() {
      return getFullMessage()
    },
  }
}
