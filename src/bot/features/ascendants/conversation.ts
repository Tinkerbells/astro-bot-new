import type { Conversation } from '@grammyjs/conversations'

import type { Context } from '#root/bot/context.js'

import { MenuId } from '#root/bot/shared/menus/menu-ids.js'
import { canUseAstroFeature } from '#root/bot/shared/helpers/user.js'
import { PROFILE_MENU_TEXT_KEY } from '#root/bot/shared/menus/index.js'
import { birthDataForm } from '#root/bot/shared/forms/birth-data/index.js'
import { setConversationLocale } from '#root/bot/shared/helpers/conversation-locale.js'

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

  const menu = ctx.menuManager.createConversationMenu(conversation, MenuId.Profile)

  const sendProfileMenuInConversation = async () => {
    if (!menu) {
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
        replyMarkup: menu,
      })
    })
  }

  const handleCancel = async () => {
    await conversation.external(async (externalCtx) => {
      await ctx.menuManager.replyWithConversationMenu({
        conversationCtx: ctx,
        externalCtx,
        menuKey: MenuId.Profile,
        textKey: PROFILE_MENU_TEXT_KEY,
        replyMarkup: menu!,
      })
    })
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
  })

  await sendProfileMenuInConversation()
}
