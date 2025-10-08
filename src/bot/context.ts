import type { I18nFlavor } from '@grammyjs/i18n'
import type { HydrateFlavor } from '@grammyjs/hydrate'
import type { ParseModeFlavor } from '@grammyjs/parse-mode'
import type { ConversationFlavor } from '@grammyjs/conversations'
import type { AutoChatActionFlavor } from '@grammyjs/auto-chat-action'
import type { Context as DefaultContext, SessionFlavor } from 'grammy'

import type { Config } from '#root/shared/config.js'
import type { Logger } from '#root/shared/logger.js'
import type { User } from '#root/domain/entities/user/user.js'
import type { UserService } from '#root/bot/services/user-service/index.js'

import type { SafeReply } from './shared/helpers/safe-reply/index.js'
import type { OnboardingState } from './shared/types/onboarding.types.js'

export type SessionData = {
  user: User
  onboarding: OnboardingState
}

type ExtendedContextFlavor = {
  logger: Logger
  config: Config
  userService: UserService
  safeReply: SafeReply
}

// Внешний контекст (используется в middleware)
export type Context = ConversationFlavor<
  ParseModeFlavor<
    HydrateFlavor<
      DefaultContext &
      ExtendedContextFlavor &
      SessionFlavor<SessionData> &
      I18nFlavor &
      AutoChatActionFlavor
    >
  >
>
