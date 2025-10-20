import type { BotConfig } from 'grammy'
import type { ConversationData, VersionedState } from '@grammyjs/conversations'

import { hydrate } from '@grammyjs/hydrate'
import { Bot as TelegramBot } from 'grammy'
import { sequentialize } from '@grammyjs/runner'
import { RedisAdapter } from '@grammyjs/storage-redis'
import { autoChatAction } from '@grammyjs/auto-chat-action'
import { hydrateReply, parseMode } from '@grammyjs/parse-mode'
import { conversations, createConversation } from '@grammyjs/conversations'

import type { Config } from '#root/shared/config.js'
import type { Logger } from '#root/shared/logger.js'
import type { Context, SessionData } from '#root/bot/context.js'

import { createRedisClient } from '#root/shared/index.js'
import { errorHandler } from '#root/bot/handlers/error.js'
// import { i18n, isMultipleLocales } from '#root/bot/i18n.js'
import { i18n } from '#root/bot/services/i18n-service/i18n.js'
import { adminFeature } from '#root/bot/features/admin/index.js'
import { session } from '#root/bot/shared/middlewares/session.js'
import { profileFeature } from '#root/bot/features/profile/index.js'
// import { languageFeature } from '#root/bot/features/language/index.js'
import { unhandledFeature } from '#root/bot/features/unhandled/index.js'
import { updateLogger } from '#root/bot/shared/middlewares/update-logger.js'
import { createUserSessionMiddleware } from '#root/bot/shared/middlewares/user.js'
import { ONBOARDING_CONVERSATION, onboardingConversation, onboardingFeature } from '#root/bot/features/onboarding/index.js'
import { ASCENDANTS_GUEST_CONVERSATION, ascendantsFeature, ascendantsGuestConversation } from '#root/bot/features/ascendants/index.js'
import { NATAL_CHARTS_GUEST_CONVERSATION, natalChartsFeature, natalChartsGuestConversation } from '#root/bot/features/natal-charts/index.js'
import { COMPATIBILITIES_GUEST_CONVERSATION, compatibilitiesFeature, compatibilitiesGuestConversation } from '#root/bot/features/compatibilities/index.js'

import type { UserService } from './services/user-service/index.js'
import type { CityService } from './services/city-service/city-service.js'
import type { AscendantsService } from './services/ascendants-service/index.js'
import type { NatalChartsService } from './services/natal-charts-service/index.js'
import type { CompatibilitiesService } from './services/natal-chart-compatibilities-service/index.js'

import { profileMenu } from './shared/menus/index.js'
import { safeReply } from './shared/helpers/safe-reply.js'
import { OnboardingStatus } from './shared/types/onboarding.types.js'
import { createMenuManager } from './shared/services/menu-manager.js'
import { safeEditMarkdownMessage, safeReplyMarkdown } from './shared/helpers/safe-reply-markdown.js'

type Dependencies = {
  config: Config
  logger: Logger
  userService: UserService
  cityService: CityService
  natalChartsService: NatalChartsService
  ascendantsService: AscendantsService
  compatibilitiesService: CompatibilitiesService
}

function getUserSessionKey(ctx: Omit<Context, 'session'>) {
  // Храним данные по каждому пользователю отдельно для персистентности
  return ctx.from?.id.toString()
}

function getUserConversationKey(ctx: Omit<Context, 'session'>) {
  // Храним данные по каждому пользователю отдельно для персистентности
  return `convo-${ctx.from?.id.toString()}`
}

export function createBot(token: string, dependencies: Dependencies, botConfig?: BotConfig<Context>) {
  const {
    config,
    logger,
    userService,
    cityService,
    natalChartsService,
    ascendantsService,
    compatibilitiesService,
  } = dependencies

  const bot = new TelegramBot<Context>(token, botConfig)

  bot.use(async (ctx, next) => {
    ctx.config = config
    ctx.userService = userService
    ctx.natalChartsService = natalChartsService
    ctx.ascendantsService = ascendantsService
    ctx.compatibilitiesService = compatibilitiesService
    ctx.menuManager = createMenuManager(ctx)
    ctx.cityService = cityService
    ctx.logger = logger.child({
      update_id: ctx.update.update_id,
    })
    ctx.safeReply = safeReply(ctx)
    ctx.safeReplyMarkdown = safeReplyMarkdown(ctx)
    ctx.safeEditMarkdownMessage = safeEditMarkdownMessage(ctx)

    await next()
  })

  const protectedBot = bot.errorBoundary(errorHandler)

  // Middlewares
  bot.api.config.use(parseMode('HTML'))

  if (config.isPollingMode)
    protectedBot.use(sequentialize(getUserSessionKey))
  if (config.isDebug)
    protectedBot.use(updateLogger())
  // protectedBot.use(ignoreOld())
  protectedBot.use(autoChatAction(bot.api))
  protectedBot.use(hydrateReply)
  protectedBot.use(hydrate())
  protectedBot.use(session({
    getSessionKey: getUserSessionKey,
    initial: (): SessionData => {
      // Начальное значение будет переопределено в user middleware
      // Но TypeScript требует обязательное поле user
      return {
        onboarding:
          { current: 0, status: OnboardingStatus.Idle, stepsData: [], totalSteps: 3 },
      } as unknown as SessionData
    },
    storage: new RedisAdapter<SessionData>({
      instance: createRedisClient(config.redisUrl),
      ttl: 86400, // 24 часа для пользовательских данных
    }),
  }))
  protectedBot.use(i18n)
  // TODO: когда будет мультиязычный бот убрать
  protectedBot.use(async (ctx, next) => {
    // Проверяем текущую локаль и если она не установлена или не 'ru', устанавливаем 'ru'
    const currentLocale = await ctx.i18n.getLocale()
    if (currentLocale !== 'ru') {
      await ctx.i18n.setLocale('ru')
    }
    await next()
  })
  protectedBot.use(createUserSessionMiddleware(userService))

  protectedBot.use(conversations<Context, Context>({
    // TODO: попробовать что-то придумать тут
    // onEnter: () => {
    //   setConversationLocale()
    // },
    storage: {
      type: 'key',
      version: 1, // Версия для миграции данных при изменении диалогов
      adapter: new RedisAdapter<VersionedState<ConversationData>>({
        instance: createRedisClient(config.redisUrl),
        ttl: 86400, // 24 часа для данных диалогов
      }),
      getStorageKey: getUserConversationKey,
    },
    plugins: [
      // Добавляем config, logger, userService, natalChartsService, ascendantsService и natalChartCompatibilitiesService в контекст диалога
      hydrate(),
      async (ctx, next) => {
        ctx.config = config
        ctx.userService = userService
        ctx.natalChartsService = natalChartsService
        ctx.ascendantsService = ascendantsService
        ctx.menuManager = createMenuManager(ctx)
        ctx.compatibilitiesService = compatibilitiesService
        ctx.cityService = cityService
        ctx.logger = logger.child({
          update_id: ctx.update.update_id,
        })
        ctx.safeReply = safeReply(ctx)
        ctx.safeReplyMarkdown = safeReplyMarkdown(ctx)
        ctx.safeEditMarkdownMessage = safeEditMarkdownMessage(ctx)
        await next()
      },
      i18n.middleware(),
    ],
  }))

  // Сначала регистрируем все conversations
  protectedBot.use(createConversation(onboardingConversation, ONBOARDING_CONVERSATION))
  protectedBot.use(createConversation(natalChartsGuestConversation, NATAL_CHARTS_GUEST_CONVERSATION))
  protectedBot.use(createConversation(ascendantsGuestConversation, ASCENDANTS_GUEST_CONVERSATION))
  protectedBot.use(createConversation(compatibilitiesGuestConversation, COMPATIBILITIES_GUEST_CONVERSATION))

  // Потом регистрируем меню (которые используют conversations)
  protectedBot.use(profileMenu)

  protectedBot.use(profileFeature)

  protectedBot.use(natalChartsFeature)
  protectedBot.use(ascendantsFeature)
  protectedBot.use(compatibilitiesFeature)

  // Handlers
  protectedBot.use(onboardingFeature)
  protectedBot.use(adminFeature)
  // TODO: добавить, когда появится жесткая необходимость
  // if (isMultipleLocales)
  //   protectedBot.use(languageFeature)

  // must be the last handler
  protectedBot.use(unhandledFeature)

  return bot
}

export type Bot = ReturnType<typeof createBot>
