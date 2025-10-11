import type { Conversation } from '@grammyjs/conversations'

import type { Context } from '#root/bot/context.js'
import type { AstroDataResult } from '#root/bot/shared/forms/astro-data/index.js'

import { collectAstroData } from '#root/bot/shared/forms/astro-data/index.js'
import { exampleFormStep, exampleFormStep2 } from '#root/bot/shared/forms/form-step.js'
import { setConversationLocale } from '#root/bot/shared/helpers/conversation-locale.js'
import { buildProfileMenuRange, createProfileMessage, PROFILE_MENU_ID } from '#root/bot/shared/menus/index.js'

export const NATAL_CHARTS_GUEST_CONVERSATION = 'natal-charts-guest'

export async function natalChartsGuestConversationn(
  conversation: Conversation<Context, Context>,
  ctx: Context,
) {
  await setConversationLocale(conversation, ctx)

  // TODO: добавить ключи для гостя
  // await ctx.safeReply(ctx.t('onboarding-start'))

  await collectAstroData(conversation, ctx, {
    callback: async (ctx, data: AstroDataResult) => {
      const birthDateTime = `${data.birthDate}T${data.birthTime}:00`
      const dto = {
        userId: Number(ctx.session.user.id),
        birthDateTime,
        latitude: data.latitude,
        longitude: data.longitude,
      }
      await ctx.natalChartsService.replyWithGuestNatalChart(ctx, dto)
    },
  })

  const message = await conversation.external(ctx => createProfileMessage(ctx).getText())
  const menu = conversation.menu(PROFILE_MENU_ID).dynamic((_, range) => {
    buildProfileMenuRange(range)
  })

  await ctx.safeReply(message, {
    reply_markup: menu,
  })
}

export async function natalChartsGuestConversation(
  conversation: Conversation<Context, Context>,
  ctx: Context,
) {
  await setConversationLocale(conversation, ctx)

  const name1 = await exampleFormStep({ ctx, conversation }).build()

  if (name1) {
    await ctx.reply(name1)
  }

  const name2 = await exampleFormStep2({ ctx, conversation }).build()

  if (name2) {
    await ctx.reply(name2)
  }

  await ctx.reply('Conversation is finished')
}
