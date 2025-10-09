import type { MenuRange } from '@grammyjs/menu'
import type { ConversationMenuRange } from '@grammyjs/conversations'

import type { Context } from '#root/bot/context.js'

import { ONBOARDING_CONVERSATION } from '#root/bot/features/index.js'

/**
 * Интерфейс для MenuRange (работает с обычным Menu и Conversation Menu)
 */

/**
 * Заполняет MenuRange кнопками профиля
 * Используется как в обычном меню, так и в conversations
 */
type ProfileMenuOptions = {
  natalChartsMenuId?: string
}

export function buildProfileMenuRange(
  range: MenuRange<Context> | ConversationMenuRange<Context>,
  options: ProfileMenuOptions = {},
) {
  range.text(
    ctx => ctx.t('profile-menu-ascendant'),
    async (ctx) => {
      await ctx.reply(ctx.t('profile-ascendant-message'))
    },
  ).row()

  if (options.natalChartsMenuId) {
    range.submenu(
      ctx => ctx.t('profile-menu-natal-chart'),
      options.natalChartsMenuId,
    ).row()
  }
  else {
    range.text(
      ctx => ctx.t('profile-menu-natal-chart'),
      async (ctx) => {
        await ctx.reply(ctx.t('profile-natal-chart-message'))
      },
    ).row()
  }

  range.text(
    ctx => ctx.t('profile-menu-compatibility'),
    async (ctx) => {
      await ctx.reply(ctx.t('profile-compatibility-message'))
    },
  ).row()

  range.text(
    ctx => ctx.t('profile-menu-tarot'),
    async (ctx) => {
      await ctx.reply(ctx.t('profile-tarot-message'))
    },
  ).row()

  range.text(
    ctx => ctx.t('profile-menu-settings'),
    async (ctx) => {
      await ctx.reply(ctx.t('profile-settings-message'))
    },
  ).row()

  range.text(
    ctx => ctx.t('profile-menu-restart-onboarding'),
    async (ctx) => {
      await ctx.reply(ctx.t('profile-restart-onboarding-message'))
      await ctx.conversation.enter(ONBOARDING_CONVERSATION)
    },
  )
}
