import type { Conversation } from '@grammyjs/conversations'

import type { Context } from '#root/bot/context.js'

/**
 * Устанавливает локаль пользователя для текущего контекста i18n.
 *
 * ⚠️ Обязательно вызывайте эту функцию **в самом начале** каждого conversation,
 * чтобы обеспечить корректную локализацию всех последующих сообщений.
 *
 * @param conversation - Экземпляр conversation из `@grammyjs/conversations`
 * @param ctx - Контекст бота
 */
export async function setConversationLocale(conversation: Conversation<Context, Context>, ctx: Context) {
  // const { __language_code: locale = 'ru' } = await conversation.external(ctx => ctx.session)
  ctx.i18n.useLocale('ru')
}
