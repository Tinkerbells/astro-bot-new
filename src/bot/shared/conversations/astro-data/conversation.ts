import type { Conversation } from '@grammyjs/conversations'

import type { Context } from '#root/bot/context.js'

import { setConversationLocale } from '../../helpers/conversation-locale.js'

export const ASTRO_DATA_CONVERSATION = 'astro-data'

export async function astroData(
  conversation: Conversation<Context, Context>,
  ctx: Context,
) {
  await setConversationLocale(conversation, ctx)
}
