import type { Context } from '#root/bot/context.js'

import { profileMenu } from '../menu.js'
import { PROFILE_MENU_TEXT_KEY } from './create-profile-message.js'

/**
 * Отправляет profile меню вне conversation
 * Используется после завершения conversations для возврата к основному меню
 */
export async function sendProfileMenuOutsideConversation(ctx: Context): Promise<void> {
  await ctx.reply(ctx.t(PROFILE_MENU_TEXT_KEY), {
    reply_markup: profileMenu,
  })
}
