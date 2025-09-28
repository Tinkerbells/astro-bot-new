import type { Logger } from '#root/shared/logger.js'

export type Env = {
  Variables: {
    requestId: string
    logger: Logger
  }
}
