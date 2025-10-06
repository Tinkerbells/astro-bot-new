import { Menu } from '@grammyjs/menu'

import type { Context } from '#root/bot/context.js'
import type { User } from '#root/domain/entities/user/user.js'

export const PROFILE_MENU_ID = 'profile-menu'

export const profileMenu = new Menu<Context>(PROFILE_MENU_ID)
  .text(
    ctx => ctx.t('profile-menu-ascendant'),
    async (ctx) => {
      await ctx.reply(ctx.t('profile-ascendant-message'))
    },
  )
  .row()
  .text(
    ctx => ctx.t('profile-menu-natal-chart'),
    async (ctx) => {
      await ctx.reply(ctx.t('profile-natal-chart-message'))
    },
  )
  .row()
  .text(
    ctx => ctx.t('profile-menu-compatibility'),
    async (ctx) => {
      await ctx.reply(ctx.t('profile-compatibility-message'))
    },
  )
  .row()
  .text(
    ctx => ctx.t('profile-menu-tarot'),
    async (ctx) => {
      await ctx.reply(ctx.t('profile-tarot-message'))
    },
  )
  .row()
  .text(
    ctx => ctx.t('profile-menu-settings'),
    async (ctx) => {
      await ctx.reply(ctx.t('profile-settings-message'))
    },
  )
  .row()
  .text(
    ctx => ctx.t('profile-menu-restart-onboarding'),
    async (ctx) => {
      await ctx.reply(ctx.t('profile-restart-onboarding-message'))
      await ctx.conversation.enter('onboarding')
    },
  )

type ProfileMessageOptions = {
  ctx: Context
  user: User
  zodiacText?: string
}

/**
 * Создает билдер для формирования profile сообщений
 */
export function createProfileMessage(options: ProfileMessageOptions) {
  const { ctx, user, zodiacText } = options

  const profileInfo = ctx.t('profile-info', {
    name: user.firstName ?? ctx.t('profile-field-missing'),
    birthDate: user.birthDate ?? ctx.t('profile-field-missing'),
    birthTime: user.birthTime ?? ctx.t('profile-field-missing'),
    timezone: user.timezone ?? ctx.t('profile-field-missing'),
    city: ctx.t('profile-field-missing'), // TODO: добавить city когда появится в User
    zodiac: zodiacText ?? ctx.t('profile-field-missing'),
  })

  const fullMessage = `${ctx.t('profile-title')}\n\n${profileInfo}`

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
