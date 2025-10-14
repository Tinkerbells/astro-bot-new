import type { Conversation } from '@grammyjs/conversations'

import type { Context } from '#root/bot/context.js'

import { MenuId } from '#root/bot/shared/menus/menu-ids.js'
import { canUseAstroFeature } from '#root/bot/shared/helpers/user.js'
import { PROFILE_MENU_TEXT_KEY } from '#root/bot/shared/menus/index.js'
import { birthDataForm } from '#root/bot/shared/forms/birth-data/index.js'
import { setConversationLocale } from '#root/bot/shared/helpers/conversation-locale.js'

export const NATAL_CHARTS_GUEST_CONVERSATION = 'natal-charts-guest'

export async function natalChartsGuestConversation(
  conversation: Conversation<Context, Context>,
  ctx: Context,
) {
  await setConversationLocale(conversation, ctx)
  const conversationMenu = ctx.menuManager.createConversationMenu(conversation, MenuId.Profile)

  const sendProfileMenuInConversation = async () => {
    if (!conversationMenu) {
      ctx.logger.error({ menuId: MenuId.Profile }, 'Profile conversation menu is not registered')
      await ctx.safeReply(ctx.t(PROFILE_MENU_TEXT_KEY))
      return
    }

    await conversation.external(async (externalCtx) => {
      await ctx.menuManager.replyWithConversationMenu({
        conversationCtx: ctx,
        externalCtx,
        menuKey: MenuId.Profile,
        textKey: PROFILE_MENU_TEXT_KEY,
        replyMarkup: conversationMenu,
      })
    })
  }

  const sendProfileMenuOutsideConversation = async (externalCtx: Context) => {
    const rootMenu = externalCtx.menuManager.getMenuMarkup(MenuId.Profile)
    if (!rootMenu) {
      externalCtx.logger.error({ menuId: MenuId.Profile }, 'Profile menu is not registered')
      await externalCtx.safeReply(externalCtx.t(PROFILE_MENU_TEXT_KEY))
      return
    }

    await externalCtx.menuManager.replyWithMenu({
      menuKey: MenuId.Profile,
      textKey: PROFILE_MENU_TEXT_KEY,
      replyMarkup: rootMenu,
    })
  }

  const handleCancel = async (externalCtx: Context) => {
    await sendProfileMenuOutsideConversation(externalCtx)
  }

  await conversation.external(async (ctx) => {
    if (!canUseAstroFeature(ctx.session.user)) {
      // TODO: добавить i18n ключ
      await ctx.reply('Вы не заполнили профиль! /onboarding')
      await ctx.conversation.exit(NATAL_CHARTS_GUEST_CONVERSATION)
    }
  })
  // TODO: добавить i18n ключ
  await ctx.reply('Заполоните данные гостя')

  const checkpoint = conversation.checkpoint()

  const data = await birthDataForm(checkpoint, ctx, conversation, {
    conversationId: NATAL_CHARTS_GUEST_CONVERSATION,
  }, handleCancel)

  await conversation.external(async (ctx) => {
    const birthDateTime = `${data.birthDate}T${data.birthTime}:00`
    const dto = {
      userId: Number(ctx.session.user.id),
      birthDateTime,
      latitude: data.birthPlace.latitude,
      longitude: data.birthPlace.longitude,
    }
    await ctx.natalChartsService.replyWithGuestNatalChart(ctx, dto)
  })

  await sendProfileMenuInConversation()
}
