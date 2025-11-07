import type { NextFunction } from 'grammy'

import type { Context } from '#root/bot/context.js'

export function ignoreOld(threshold: number = 5 * 60) {
  return async (ctx: Context, next: NextFunction): Promise<void> => {
    if (
      ctx.msg?.date
      && new Date().getTime() / 1000 - ctx.msg.date > threshold
    ) {
      ctx.logger.debug(
        `Ignoring message from user ${ctx.from?.id} at chat ${ctx.chat?.id} (${new Date().getTime() / 1000
        }:${ctx.msg.date})`,
      )
      return
    }
    await next()
  }
}
