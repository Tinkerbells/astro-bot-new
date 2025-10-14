import type { Conversation } from '@grammyjs/conversations'

import type { Context } from '#root/bot/context.js'

import { safeAsync } from '#root/shared/index.js'
import { MenuId } from '#root/bot/shared/menus/menu-ids.js'
import { PROFILE_MENU_TEXT_KEY } from '#root/bot/shared/menus/index.js'
import { birthDataForm } from '#root/bot/shared/forms/birth-data/index.js'
import { setConversationLocale } from '#root/bot/shared/helpers/conversation-locale.js'

import { compatibilityLabelStep } from './forms/compatibility-label.js'

export const COMPATIBILITIES_GUEST_CONVERSATION = 'compatibilities-guest'

export async function compatibilitiesGuestConversation(
  conversation: Conversation<Context, Context>,
  ctx: Context,
) {
  await setConversationLocale(conversation, ctx)

  // TODO: добавить i18n ключ
  await ctx.reply('Заполните данные партнёра для расчёта совместимости')

  const checkpoint = conversation.checkpoint()

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
  })

  // Создаем меню для conversation и отправляем сообщение с профилем
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

  await sendProfileMenuInConversation()
}
