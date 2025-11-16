import type { MenuRange } from '@grammyjs/menu'
import type { ConversationMenuRange } from '@grammyjs/conversations'

import type { Context } from '#root/bot/context.js'

import { safeAsync } from '#root/shared/index.js'
import { TarotRepositoryDTO } from '#root/data/index.js'
import { ConversationsEnum } from '#root/bot/conversations/enum.js'

import { createProfileMessage } from '../../profile-menu/utils/create-profile-message.js'

const SPREAD_TYPE_WITH_QUESTION = [
  TarotRepositoryDTO.TarotSpreadTypesEnum.three_card,
  TarotRepositoryDTO.TarotSpreadTypesEnum.yes_no,
  TarotRepositoryDTO.TarotSpreadTypesEnum.love,
  TarotRepositoryDTO.TarotSpreadTypesEnum.celtic_cross,
  TarotRepositoryDTO.TarotSpreadTypesEnum.career,
  TarotRepositoryDTO.TarotSpreadTypesEnum.decision,
]

// Mapping spread types to translation keys
const SPREAD_TRANSLATIONS: Record<TarotRepositoryDTO.TarotSpreadType, string> = {
  [TarotRepositoryDTO.TarotSpreadTypesEnum.one_card]: 'tarot-menu-one-card',
  [TarotRepositoryDTO.TarotSpreadTypesEnum.three_card]: 'tarot-menu-three-card',
  [TarotRepositoryDTO.TarotSpreadTypesEnum.yes_no]: 'tarot-menu-yes-no',
  [TarotRepositoryDTO.TarotSpreadTypesEnum.love]: 'tarot-menu-love',
  [TarotRepositoryDTO.TarotSpreadTypesEnum.celtic_cross]: 'tarot-menu-celtic-cross',
  [TarotRepositoryDTO.TarotSpreadTypesEnum.career]: 'tarot-menu-career',
  [TarotRepositoryDTO.TarotSpreadTypesEnum.yearly]: 'tarot-menu-yearly',
  [TarotRepositoryDTO.TarotSpreadTypesEnum.decision]: 'tarot-menu-decision',
}

export function buildTarotMenuRange(
  range: MenuRange<Context> | ConversationMenuRange<Context>,
) {
  // Get all spread types from enum
  const spreadTypes = Object.values(TarotRepositoryDTO.TarotSpreadTypesEnum)
    .filter((value): value is TarotRepositoryDTO.TarotSpreadType => typeof value === 'number')

  // Create button for each spread type
  spreadTypes.forEach(async (spreadType, index) => {
    const translationKey = SPREAD_TRANSLATIONS[spreadType]

    const requiresQuestion = SPREAD_TYPE_WITH_QUESTION.includes(spreadType)

    if (requiresQuestion) {
      range.text(
        ctx => ctx.t(translationKey),
        async (ctx) => {
          await ctx.conversation.enter(ConversationsEnum.tarot, spreadType)
        },
      )
    }
    else {
      range.text(
        ctx => ctx.t(translationKey),
        async (ctx) => {
          const [error, reading] = await safeAsync(
            ctx.tarotService.createReading(ctx, {
              spreadType,
            }),
          )

          if (error) {
            await ctx.reply(ctx.t('errors-something-went-wrong'))
            ctx.logger.error({ err: error }, 'Failed to create tarot reading')
            return
          }

          if (!reading) {
            ctx.logger.error('Tarot reading response is empty')
            await ctx.reply(ctx.t('errors-something-went-wrong'))
            return
          }

          await ctx.tarotService.replyWithReading(ctx, reading)
        },
      )
    }

    // Add row break after every 2 buttons for better layout
    if ((index + 1) % 2 === 0) {
      range.row()
    }
  })

  // Add row before back button if needed
  if (spreadTypes.length % 2 !== 0) {
    range.row()
  }

  // Back button
  range.back(
    ctx => ctx.t('tarot-menu-back'),
    async (ctx) => {
      const messageText = createProfileMessage(ctx).getText()
      await ctx.editMessageText(messageText)
      ctx.menu.back()
    },
  )
}
