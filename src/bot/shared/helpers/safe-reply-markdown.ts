import type { Other } from '@grammyjs/hydrate'

import type { Context } from '#root/bot/context.js'

export function safeReplyMarkdown(ctx: Context) {
  return async (
    text: string,
    other?: Other<'sendMessage', 'chat_id' | 'text'>,
  ) => {
    try {
      return await ctx.reply(text, { ...other, parse_mode: 'MarkdownV2' })
    }
    catch (error) {
      ctx.logger.warn(
        { err: error },
        'Failed with MarkdownV2, trying Markdown',
      )
      try {
        return await ctx.reply(text, { ...other, parse_mode: 'Markdown' })
      }
      catch (fallbackError) {
        ctx.logger.warn(
          { err: fallbackError },
          'Failed with Markdown, falling back to plain text',
        )
        return await ctx.reply(text, other)
      }
    }
  }
}

export type SafeReplyMarkdown = ReturnType<typeof safeReplyMarkdown>
