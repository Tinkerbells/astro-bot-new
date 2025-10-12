import type { MenuRange } from '@grammyjs/menu'
import type { ConversationMenuRange } from '@grammyjs/conversations'

import type { Context } from '#root/bot/context.js'

import { ONBOARDING_CONVERSATION } from '#root/bot/features/index.js'

import { ASCENDANTS_MENU_ID } from '../../ascendants-menu/menu.js'
import { NATAL_CHARTS_MENU_ID } from '../../natal-charts-menu/menu.js'

/**
 * Интерфейс для MenuRange (работает с обычным Menu и Conversation Menu)
 */

/**
 * Заполняет MenuRange кнопками профиля
 * Используется как в обычном меню, так и в conversations
 */

export function buildProfileMenuRange(
  range: MenuRange<Context> | ConversationMenuRange<Context>,
) {
  range.submenu(
    ctx => ctx.t('profile-menu-ascendant'),
    ASCENDANTS_MENU_ID,
  )

  range.submenu(
    ctx => ctx.t('profile-menu-natal-chart'),
    NATAL_CHARTS_MENU_ID,
  ).row()

  range.text(
    ctx => ctx.t('profile-menu-compatibility'),
    async (ctx) => {
      await ctx.reply(ctx.t('profile-compatibility-message'))
    },
  )

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
  ).row()
}
