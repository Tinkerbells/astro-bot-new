import type { Context } from '#root/bot/context.js'

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
      const menu = ctx.menuManager.getMenuMarkup(MenuId.Profile)
      if (!menu) {
        ctx.logger.error({ menuId: MenuId.Profile }, 'Profile menu is not registered')
        return ctx.safeReply(ctx.t(textKey))
      }

      return ctx.menuManager.replyWithMenu({
        menuKey: MenuId.Profile,
        textKey,
        replyMarkup: menu,
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
      const menu = ctx.menuManager.getMenuMarkup(MenuId.Profile)
      if (!menu) {
        ctx.logger.error({ menuId: MenuId.Profile }, 'Profile menu is not registered')
        await ctx.editMessageText(getFullMessage())
        return
      }

      await ctx.editMessageText(getFullMessage(), {
        reply_markup: menu,
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
