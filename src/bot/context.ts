import type { I18nFlavor } from '@grammyjs/i18n'
import type { MenuFlavor } from '@grammyjs/menu'
import type { HydrateFlavor } from '@grammyjs/hydrate'
import type { ParseModeFlavor } from '@grammyjs/parse-mode'
import type { ConversationFlavor } from '@grammyjs/conversations'
import type { AutoChatActionFlavor } from '@grammyjs/auto-chat-action'
import type { Context as DefaultContext, SessionFlavor } from 'grammy'

import type { Config } from '#root/shared/config.js'
import type { Logger } from '#root/shared/logger.js'
import type { User } from '#root/domain/entities/user/user.js'
import type { UserService } from '#root/bot/services/user-service/index.js'
import type { AscendantsService } from '#root/bot/services/ascendants-service/index.js'
import type { NatalChartsService } from '#root/bot/services/natal-charts-service/index.js'

import type { SafeReply } from './shared/helpers/safe-reply.js'
import type { AttemptsState } from './shared/forms/plugins/attempts.js'
import type { OnboardingState } from './shared/types/onboarding.types.js'
import type { CityService } from './services/city-service/city-service.js'
import type { SafeReplyMarkdown } from './shared/helpers/safe-reply-markdown.js'

export type SessionData = {
  user: User
  onboarding: OnboardingState
  __language_code?: string
  __formAttempts?: AttemptsState
}

type ExtendedContextFlavor = {
  logger: Logger
  config: Config
  userService: UserService
  natalChartsService: NatalChartsService
  ascendantsService: AscendantsService
  cityService: CityService
  safeReply: SafeReply
  safeReplyMarkdown: SafeReplyMarkdown
}

// Внешний контекст (используется в middleware)
export type Context = ConversationFlavor<
  ParseModeFlavor<
    HydrateFlavor<
      DefaultContext &
      ExtendedContextFlavor &
      SessionFlavor<SessionData> &
      I18nFlavor &
      AutoChatActionFlavor &
      MenuFlavor
    >
  >
>
