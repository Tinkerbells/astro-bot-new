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
import type { NatalChartCompatibilitiesRepositoryDTO } from '#root/data/index.js'
import type { AscendantsService } from '#root/bot/services/ascendants-service/index.js'
import type { NatalChartsService } from '#root/bot/services/natal-charts-service/index.js'
import type { CompatibilitiesService } from '#root/bot/services/natal-chart-compatibilities-service/index.js'

import type { SafeReply } from './shared/helpers/safe-reply.js'
import type { AttemptsState } from './shared/forms/plugins/attempts.js'
import type { OnboardingState } from './shared/types/onboarding.types.js'
import type { CityService } from './services/city-service/city-service.js'
import type { MenuManager, MenuNavigationData } from './shared/services/menu-manager.js'
import type { SafeEditMarkdownMessage, SafeReplyMarkdown } from './shared/helpers/safe-reply-markdown.js'

export type SessionData = {
  user: User
  onboarding: OnboardingState
  // TODO: посмотреть как лучше можно работать с этим
  lastCompatibilityInterpretation?: NatalChartCompatibilitiesRepositoryDTO.NatalChartCompatibilityInterpretation
  compatibilitiesList?: NatalChartCompatibilitiesRepositoryDTO.NatalChartCompatibilityDTO[]
  menus?: Record<string, MenuNavigationData>
  __language_code?: string
  __formAttempts?: AttemptsState
}

type ExtendedContextFlavor = {
  logger: Logger
  config: Config
  menuManager: MenuManager
  userService: UserService
  natalChartsService: NatalChartsService
  ascendantsService: AscendantsService
  compatibilitiesService: CompatibilitiesService
  cityService: CityService
  safeReply: SafeReply
  safeReplyMarkdown: SafeReplyMarkdown
  safeEditMarkdownMessage: SafeEditMarkdownMessage
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
