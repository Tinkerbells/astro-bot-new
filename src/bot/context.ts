import type { I18nFlavor } from '@grammyjs/i18n'
import type { HydrateFlavor } from '@grammyjs/hydrate'
import type { ParseModeFlavor } from '@grammyjs/parse-mode'
import type { ConversationFlavor } from '@grammyjs/conversations'
import type { AutoChatActionFlavor } from '@grammyjs/auto-chat-action'
import type { Context as DefaultContext, SessionFlavor } from 'grammy'

import type { Config } from '#root/shared/config.js'
import type { Logger } from '#root/shared/logger.js'
import type { User } from '#root/domain/entities/user/user.js'

export type SessionData = {
  user: User
}

type ExtendedContextFlavor = {
  logger: Logger
  config: Config
}

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
