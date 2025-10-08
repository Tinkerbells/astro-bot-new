import type { Context } from '#root/bot/context.js'

import { profileMenu } from '../menu.js'

/**
 * Создает билдер для формирования profile сообщений
 */
export function createProfileMessage(ctx: Context) {
  const user = ctx.session.user

  let zodiacText: string | undefined
  if (user.zodiac) {
    zodiacText = `${user.zodiac.icon} ${ctx.t(user.zodiac.i18key)}`
  }

  const profileInfo = ctx.t('profile-info', {
    name: user.firstName ?? ctx.t('profile-field-missing'),
    birthDate: user.birthDate ?? ctx.t('profile-field-missing'),
    birthTime: user.birthTime ?? ctx.t('profile-field-missing'),
    timezone: user.timezone ?? ctx.t('profile-field-missing'),
    city: ctx.t('profile-field-missing'), // TODO: добавить city когда появится в User
    zodiac: zodiacText ?? ctx.t('profile-field-missing'),
  })

  const fullMessage = profileInfo

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

    /**
     * Возвращает только текст информации без заголовка
     */
    getInfoOnly() {
      return profileInfo
    },
  }
}
