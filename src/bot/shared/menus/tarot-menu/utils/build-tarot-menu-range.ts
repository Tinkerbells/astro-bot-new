import type { MenuRange } from '@grammyjs/menu'
import type { ConversationMenuRange } from '@grammyjs/conversations'

import type { Context } from '#root/bot/context.js'

import { safeAsync } from '#root/shared/index.js'
import { TarotRepositoryDTO } from '#root/data/index.js'

import { MenuId } from '../../menu-ids.js'
import { createProfileMessage } from '../../profile-menu/utils/create-profile-message.js'

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

  // Create submenu button for each spread type
  spreadTypes.forEach((spreadType, index) => {
    const translationKey = SPREAD_TRANSLATIONS[spreadType]

    range.submenu(
      ctx => ctx.t(translationKey),
      MenuId.TarotReading,
      async (ctx) => {
        // Create reading with the selected spread type
        const [error, reading] = await safeAsync(
          ctx.tarotService.createReading(ctx, {
            spreadType,
          }),
        )

        if (error) {
          await ctx.reply(ctx.t('errors-something-went-wrong'))
          ctx.logger.error({ err: error }, 'Failed to create tarot reading')
          ctx.menu.back()
          return
        }

        if (reading) {
          // Format the reading as text for display
          const message = formatTarotReadingForMenu(ctx, reading)
          await ctx.editMessageText(message, { parse_mode: 'Markdown' })
        }
      },
    )

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

/**
 * Format tarot reading for menu display
 */
export function formatTarotReadingForMenu(
  ctx: Context,
  reading: TarotRepositoryDTO.TarotReadingResponseDTO,
): string {
  let message = ''

  // Title with label if available
  if (reading.label) {
    message += `*${reading.label}*\n\n`
  }

  // Cards
  message += `🎴 *${ctx.t('tarot-cards')}:*\n`
  reading.cards.forEach((card, index) => {
    const reversed = card.isReversed ? ` (${ctx.t('tarot-reversed')})` : ''
    message += `${index + 1}. *${card.position}*: ${card.name}${reversed}\n`
  })
  message += '\n'

  // Interpretation
  message += `✨ *${ctx.t('tarot-interpretation')}:*\n${reading.interpretation}\n\n`

  // Advice
  message += `💡 *${ctx.t('tarot-advice')}:*\n${reading.advice}\n\n`

  // Card meanings
  if (reading.cardMeanings && reading.cardMeanings.length > 0) {
    message += `📖 *${ctx.t('tarot-card-meanings')}:*\n`
    reading.cardMeanings.forEach((meaning) => {
      message += `\n*${meaning.position}* - ${meaning.cardName}:\n${meaning.meaning}\n`
    })
  }

  return message
}
