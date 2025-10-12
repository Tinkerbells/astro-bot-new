import type { Conversation } from '@grammyjs/conversations'

import type { Context } from '#root/bot/context.js'

import { birthDataForm } from '#root/bot/shared/forms/birth-data/index.js'
import { setConversationLocale } from '#root/bot/shared/helpers/conversation-locale.js'
import { buildProfileMenuRange, createProfileMessage, PROFILE_MENU_ID } from '#root/bot/shared/menus/index.js'

export const COMPATIBILITIES_GUEST_CONVERSATION = 'compatibilities-guest'

export async function compatibilitiesGuestConversation(
  conversation: Conversation<Context, Context>,
  ctx: Context,
) {
  await setConversationLocale(conversation, ctx)
  // TODO: добавить i18n ключ
  await ctx.reply('Заполните данные партнёра для расчёта совместимости')

  const checkpoint = conversation.checkpoint()

  const guestData = await birthDataForm(checkpoint, ctx, conversation)

  await conversation.external(async (ctx) => {
    const user = ctx.session.user
    const guestBirthDateTime = `${guestData.birthDate}T${guestData.birthTime}:00`

    const userName = user.firstName || user.lastName || 'Вы'
    const guestName = guestData.birthPlace.city || 'Гость'

    const dto = {
      userId: Number(user.id),
      body: {
        guest: {
          label: guestName,
          birthDateTime: guestBirthDateTime,
          timezone: guestData.birthPlace.timezone,
          latitude: guestData.birthPlace.latitude,
          longitude: guestData.birthPlace.longitude,
        },
        label: `${userName} и ${guestName}`,
      },
    }

    await ctx.natalChartCompatibilitiesService.replyWithUserGuestCompatibility(ctx, dto)
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
