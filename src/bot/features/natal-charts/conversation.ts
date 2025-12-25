import type { Conversation } from '@grammyjs/conversations'

import type { Context } from '#root/bot/context.js'

import { MenuId } from '#root/bot/shared/menus/menu-ids.js'
import { canUseAstroFeature } from '#root/bot/shared/helpers/user.js'
import { birthDataForm } from '#root/bot/shared/forms/birth-data/index.js'
import { setConversationLocale } from '#root/bot/shared/helpers/conversation-locale.js'
import { createProfileMessage } from '#root/bot/shared/menus/profile-menu/utils/index.js'
import { buildProfileMenuRange } from '#root/bot/shared/menus/profile-menu/utils/build-profile-menu-range.js'
import { sendProfileMenuOutsideConversation } from '#root/bot/shared/menus/profile-menu/utils/send-profile-menu.js'

export const NATAL_CHARTS_GUEST_CONVERSATION = 'natal-charts-guest'

export async function natalChartsGuestConversation(
  conversation: Conversation<Context, Context>,
  ctx: Context,
) {
  await setConversationLocale(conversation, ctx)

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
    const dto = {
      userId: Number(ctx.session.user.id),
      birthDate: data.birthDate,
      birthTime: data.birthTime ?? null,
      latitude: data.birthPlace.latitude,
      longitude: data.birthPlace.longitude,
      timezone: data.birthPlace.timezone,
    }
    await ctx.natalChartsService.replyWithGuestNatalChart(ctx, dto)
  })

  const menu = conversation.menu(MenuId.Profile).dynamic((_, range) => buildProfileMenuRange(range))

  const message = createProfileMessage(ctx).getText()

  await ctx.safeReply(message, { reply_markup: menu })
}
