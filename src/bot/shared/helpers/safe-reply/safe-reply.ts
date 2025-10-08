import type { Other } from '@grammyjs/hydrate'

import type { Context } from '#root/bot/context.js'

import { safeAsync } from '#root/shared/safe-async/safe-async.js'

export function safeReply(ctx: Context) {
  return async (
    text: string,
    other?: Other<'sendMessage', 'chat_id' | 'text'>,
    errorMessage?: string,
  ) => {
    if (!errorMessage) {
      errorMessage = ctx.t('errors-something-went-wrong')
    }
    const [error] = await safeAsync(ctx.reply(text, other))

    if (error) {
      ctx.logger.error({ error }, errorMessage)
      await safeAsync(ctx.reply(errorMessage))
    }
  }
}

export type SafeReply = ReturnType<typeof safeReply>
