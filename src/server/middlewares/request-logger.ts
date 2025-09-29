import type { MiddlewareHandler } from 'hono'

import { getPath } from 'hono/utils/url'

export function requestLogger(): MiddlewareHandler {
  return async (c, next) => {
    const { method } = c.req
    const path = getPath(c.req.raw)

    c.var.logger.debug({
      msg: 'Входящий запрос',
      method,
      path,
    })
    const startTime = performance.now()

    await next()

    const endTime = performance.now()
    c.var.logger.debug({
      msg: 'Запрос обработан',
      method,
      path,
      status: c.res.status,
      elapsed: endTime - startTime,
    })
  }
}
