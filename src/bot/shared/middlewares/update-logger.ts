import type { Middleware } from 'grammy'

import { performance } from 'node:perf_hooks'

import type { Context } from '#root/bot/context.js'

import { getUpdateInfo } from '#root/bot/shared/helpers/logging.js'

export function updateLogger(): Middleware<Context> {
  return async (ctx, next) => {
    ctx.api.config.use((previous, method, payload, signal) => {
      ctx.logger.debug({
        msg: 'Вызов Bot API',
        method,
        payload,
      })

      return previous(method, payload, signal)
    })

    ctx.logger.debug({
      msg: 'Обновление получено',
      update: getUpdateInfo(ctx),
    })

    const startTime = performance.now()
    try {
      await next()
    }
    finally {
      const endTime = performance.now()
      ctx.logger.debug({
        msg: 'Обновление обработано',
        elapsed: endTime - startTime,
      })
    }
  }
}
