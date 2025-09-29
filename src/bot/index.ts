import type { BotConfig } from 'grammy'

import { hydrate } from '@grammyjs/hydrate'
import { Bot as TelegramBot } from 'grammy'
import { sequentialize } from '@grammyjs/runner'
import { RedisAdapter } from '@grammyjs/storage-redis'
import { conversations } from '@grammyjs/conversations'
import { autoChatAction } from '@grammyjs/auto-chat-action'
import { hydrateReply, parseMode } from '@grammyjs/parse-mode'

import type { Config } from '#root/shared/config.js'
import type { Logger } from '#root/shared/logger.js'
import type { Context, SessionData } from '#root/bot/context.js'
import type { UserService } from '#root/application/user-service/index.js'

import { createRedisClient } from '#root/shared/index.js'
import { errorHandler } from '#root/bot/handlers/error.js'
import { i18n, isMultipleLocales } from '#root/bot/i18n.js'
import { adminFeature } from '#root/bot/features/admin/index.js'
import { session } from '#root/bot/shared/middlewares/session.js'
import { languageFeature } from '#root/bot/features/language/index.js'
import { unhandledFeature } from '#root/bot/features/unhandled/index.js'
import { createUserMiddleware } from '#root/bot/shared/middlewares/user.js'
import { updateLogger } from '#root/bot/shared/middlewares/update-logger.js'
import { greetingConversation, onboardingFeature } from '#root/bot/features/onboarding/index.js'

type Dependencies = {
  config: Config
  logger: Logger
  userService: UserService
}

function getSessionKey(ctx: Omit<Context, 'session'>) {
  return ctx.chat?.id.toString()
}

export function createBot(token: string, dependencies: Dependencies, botConfig?: BotConfig<Context>) {
  const {
    config,
    logger,
    userService,
  } = dependencies

  const bot = new TelegramBot<Context>(token, botConfig)

  bot.use(async (ctx, next) => {
    ctx.config = config
    ctx.logger = logger.child({
      update_id: ctx.update.update_id,
    })

    await next()
  })

  const protectedBot = bot.errorBoundary(errorHandler)

  // Middlewares
  bot.api.config.use(parseMode('HTML'))

  if (config.isPollingMode)
    protectedBot.use(sequentialize(getSessionKey))
  if (config.isDebug)
    protectedBot.use(updateLogger())
  // protectedBot.use(ignoreOld())
  protectedBot.use(autoChatAction(bot.api))
  protectedBot.use(hydrateReply)
  protectedBot.use(hydrate())
  protectedBot.use(session({
    getSessionKey,
    storage: new RedisAdapter<SessionData>({
      instance: createRedisClient(config.redisUrl),
      ttl: 10800, // 3 hours
    }),
  }))
  protectedBot.use(i18n)
  protectedBot.use(createUserMiddleware(userService))
  protectedBot.use(conversations())
  protectedBot.use(greetingConversation())

  // Handlers
  protectedBot.use(onboardingFeature)
  protectedBot.use(adminFeature)
  if (isMultipleLocales)
    protectedBot.use(languageFeature)

  // must be the last handler
  protectedBot.use(unhandledFeature)

  return bot
}

export type Bot = ReturnType<typeof createBot>
