import type { Conversation } from '@grammyjs/conversations'

import type { Context } from '#root/bot/context.js'

import { safeAsync } from '#root/shared/index.js'
import { birthDataForm } from '#root/bot/shared/forms/birth-data/index.js'
import { setConversationLocale } from '#root/bot/shared/helpers/conversation-locale.js'
import { sendProfileMenuOutsideConversation } from '#root/bot/shared/menus/profile-menu/utils/send-profile-menu.js'

import { createCompatibilityLabelStep } from './forms/compatibility-label.js'

export const COMPATIBILITIES_GUEST_CONVERSATION = 'compatibilities-guest'

export async function compatibilitiesGuestConversation(
  conversation: Conversation<Context, Context>,
  ctx: Context,
) {
  await setConversationLocale(conversation, ctx)

  // TODO: добавить i18n ключ
  await ctx.reply('Заполните данные партнёра для расчёта совместимости')

  const checkpoint = conversation.checkpoint()

  const compatibilityLabelStep = createCompatibilityLabelStep({ conversationId: COMPATIBILITIES_GUEST_CONVERSATION })

  const [labelError, label] = await safeAsync(compatibilityLabelStep({ ctx, conversation }).build())

  if (labelError && !label) {
    ctx.logger.error({ err: labelError })
    await ctx.reply(ctx.t('errors-something-went-wrong'))
    conversation.rewind(checkpoint)
  }

  const guestData = await birthDataForm(checkpoint, ctx, conversation, {
    conversationId: COMPATIBILITIES_GUEST_CONVERSATION,
  })

  await conversation.external(async (ctx) => {
    const user = ctx.session.user
    const guestBirthDateTime = `${guestData.birthDate}T${guestData.birthTime}:00`

    const userName = user.firstName || user.lastName || 'Вы'

    const dto = {
      userId: Number(user.id),
      body: {
        guest: {
          label: label!,
          birthDateTime: guestBirthDateTime,
          timezone: guestData.birthPlace.timezone,
          latitude: guestData.birthPlace.latitude,
          longitude: guestData.birthPlace.longitude,
        },
        label: `${userName} и ${label!}`,
      },
    }

    await ctx.compatibilitiesService.replyWithUserGuestCompatibility(ctx, dto)
    await sendProfileMenuOutsideConversation(ctx)
  })
}
