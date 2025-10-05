import { Menu } from '@grammyjs/menu'

import type { Context } from '#root/bot/context.js'

export const profileMenu = new Menu<Context>('profile-menu')
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
      // TODO: Здесь будет логика перезапуска онбординга
      // await ctx.conversation.enter('onboarding')
    },
  )
