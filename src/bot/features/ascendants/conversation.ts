import type { Conversation } from '@grammyjs/conversations'

import type { Context } from '#root/bot/context.js'

import { canUseAstroFeature } from '#root/bot/shared/helpers/user.js'
import { birthDataForm } from '#root/bot/shared/forms/birth-data/index.js'
import { setConversationLocale } from '#root/bot/shared/helpers/conversation-locale.js'
import { sendProfileMenuOutsideConversation } from '#root/bot/shared/menus/profile-menu/utils/send-profile-menu.js'

export const ASCENDANTS_GUEST_CONVERSATION = 'ascendants-guest'

export async function ascendantsGuestConversation(
  conversation: Conversation<Context, Context>,
  ctx: Context,
) {
  await setConversationLocale(conversation, ctx)
  await conversation.external(async (ctx) => {
    if (!canUseAstroFeature(ctx.session.user)) {
      // TODO: добавить i18n ключ
      await ctx.reply('Вы не заполнили профиль! /onboarding')
      await ctx.conversation.exit(ASCENDANTS_GUEST_CONVERSATION)
    }
  })
  // TODO: добавить i18n ключ
  await ctx.reply('Заполоните данные гостя')

  const checkpoint = conversation.checkpoint()

  const handleCancel = async (externalCtx: Context) => {
    await sendProfileMenuOutsideConversation(externalCtx)
  }

  const data = await birthDataForm(checkpoint, ctx, conversation, {
    conversationId: ASCENDANTS_GUEST_CONVERSATION,
  }, handleCancel)

  await conversation.external(async (ctx) => {
    const birthDate = `${data.birthDate}T${data.birthTime}:00`
    const dto = {
      userId: Number(ctx.session.user.id),
      birthDate,
      lat: data.birthPlace.latitude,
      lon: data.birthPlace.longitude,
    }
    await ctx.ascendantsService.replyWithGuestAscendant(ctx, dto)
    await sendProfileMenuOutsideConversation(ctx)
  })
}
