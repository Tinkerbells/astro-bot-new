import type { Conversation } from '@grammyjs/conversations'

import type { Context } from '#root/bot/context.js'

import { birthDataForm } from '#root/bot/shared/forms/birth-data/index.js'
import { setConversationLocale } from '#root/bot/shared/helpers/conversation-locale.js'
import { buildProfileMenuRange, createProfileMessage, PROFILE_MENU_ID } from '#root/bot/shared/menus/index.js'

export const NATAL_CHARTS_GUEST_CONVERSATION = 'natal-charts-guest'

export async function natalChartsGuestConversation(
  conversation: Conversation<Context, Context>,
  ctx: Context,
) {
  await setConversationLocale(conversation, ctx)
  // TODO: добавить i18n ключ
  await ctx.reply('Заполоните данные гостя')

  const checkpoint = conversation.checkpoint()

  const data = await birthDataForm(checkpoint, ctx, conversation)

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

  // Создаем меню для conversation и отправляем сообщение с профилем
  const message = await conversation.external(ctx => createProfileMessage(ctx).getText())
  const menu = conversation.menu(PROFILE_MENU_ID).dynamic((_, range) => {
    buildProfileMenuRange(range)
  })

  await ctx.safeReply(message, {
    reply_markup: menu,
  })
}
