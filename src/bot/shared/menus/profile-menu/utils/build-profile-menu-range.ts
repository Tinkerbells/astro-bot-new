import type { MenuRange } from '@grammyjs/menu'
import type { ConversationMenuRange } from '@grammyjs/conversations'

import type { Context } from '#root/bot/context.js'

import { safeAsync } from '#root/shared/index.js'
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
  ascendantsMenuId?: string
  compatibilitiesMenuId?: string
  tarotMenuId?: string
}

export function buildProfileMenuRange(
  range: MenuRange<Context> | ConversationMenuRange<Context>,
  options: ProfileMenuOptions = {},
) {
  if (options.ascendantsMenuId) {
    range.submenu(
      ctx => ctx.t('profile-menu-ascendant'),
      options.ascendantsMenuId,
    )
  }
  else {
    range.text(
      ctx => ctx.t('profile-menu-ascendant'),
      async (ctx) => {
        await ctx.reply(ctx.t('profile-ascendant-message'))
      },
    )
  }

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

  if (options.compatibilitiesMenuId) {
    range.submenu(
      ctx => ctx.t('profile-menu-compatibility'),
      options.compatibilitiesMenuId,
    )
  }
  else {
    range.text(
      ctx => ctx.t('profile-menu-compatibility'),
      async (ctx) => {
        await ctx.reply(ctx.t('profile-compatibility-message'))
      },
    )
  }

  if (options.tarotMenuId) {
    range.submenu(
      ctx => ctx.t('profile-menu-tarot'),
      options.tarotMenuId,
    ).row()
  }
  else {
    range.text(
      ctx => ctx.t('profile-menu-tarot'),
      async (ctx) => {
        await ctx.reply(ctx.t('profile-tarot-message'))
      },
    ).row()
  }

  range.text(
    ctx => ctx.t('profile-menu-balance'),
    async (ctx) => {
      const [balanceError, balance] = await safeAsync(
        ctx.walletService.getBalance(ctx.session.user.id),
      )

      if (balanceError || !balance) {
        await ctx.reply(ctx.t('errors-something-went-wrong'))
        ctx.logger.error({ err: balanceError }, 'Failed to fetch wallet balance')
        return
      }

      await ctx.reply(ctx.t('profile-balance-message', {
        available: balance.available,
      }))
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
