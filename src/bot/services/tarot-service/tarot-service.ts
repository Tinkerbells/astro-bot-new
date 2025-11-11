import type { Context } from '#root/bot/context.js'
import type { Logger } from '#root/shared/logger.js'
import type { TarotRepositoryDTO } from '#root/data/index.js'
import type { TarotRepository } from '#root/data/repositories/tarot-repository/tarot-repository.js'

import { logger } from '#root/shared/logger.js'
import { safeAsync } from '#root/shared/index.js'
import { ApiDataError } from '#root/shared/api-client/error/index.js'
import { tarotRepository } from '#root/data/repositories/tarot-repository/tarot-repository.js'
import { BAD_REQUEST_ERROR_INFO, FORBIDDEN_ERROR_INFO, NOT_FOUND_ERROR_INFO } from '#root/shared/http/index.js'

export class TarotService {
  constructor(
    private readonly tarotRepository: TarotRepository,
    private readonly logger: Logger,
  ) { }

  /**
   * Create a new tarot reading for a user
   */
  public async createReading(
    ctx: Context,
    dto: Omit<TarotRepositoryDTO.CreateReadingDTO, 'userId'>,
  ): Promise<TarotRepositoryDTO.TarotReadingResponseDTO | null> {
    const user = ctx.session.user
    const fetchingMessage = await ctx.reply(ctx.t('fetching'), { reply_markup: { remove_keyboard: true } })

    const [error, reading] = await safeAsync(
      this.tarotRepository.createReading({
        userId: Number(user.id),
        ...dto,
      }),
    )

    if (error) {
      await fetchingMessage.delete()

      if (this.isQuotaLimitError(error)) {
        await ctx.reply(ctx.t('error-quota-limit'))
        return null
      }

      if (this.isBadRequestError(error)) {
        const errorMessage = this.getErrorMessage(error) || ctx.t('errors-something-went-wrong')
        await ctx.reply(errorMessage)
        return null
      }

      await ctx.reply(ctx.t('errors-something-went-wrong'))
      this.logger.error({ error }, 'Failed to create tarot reading')
      return null
    }

    await fetchingMessage.delete()
    return reading
  }

  /**
   * Get a tarot reading by ID
   */
  public async getReadingById(
    ctx: Context,
    readingId: string,
  ): Promise<TarotRepositoryDTO.TarotReadingResponseDTO | null> {
    const [error, reading] = await safeAsync(
      this.tarotRepository.getReadingById({ readingId }),
    )

    if (error) {
      if (this.isNotFoundApiError(error)) {
        await ctx.reply(ctx.t('tarot-reading-not-found'))
        return null
      }

      await ctx.reply(ctx.t('errors-something-went-wrong'))
      this.logger.error({ error, readingId }, 'Failed to get tarot reading')
      return null
    }

    return reading
  }

  /**
   * Get all tarot readings for the current user
   */
  public async getUserReadings(
    ctx: Context,
    page: number = 1,
    limit: number = 10,
  ): Promise<TarotRepositoryDTO.TarotReadingResponseDTO[] | null> {
    const user = ctx.session.user

    const [error, response] = await safeAsync(
      this.tarotRepository.getReadingsByUserId({
        userId: Number(user.id),
        page,
        limit,
      }),
    )

    if (error) {
      await ctx.reply(ctx.t('errors-something-went-wrong'))
      this.logger.error({ error, userId: user.id }, 'Failed to get user readings')
      return null
    }

    if (!response) {
      await ctx.reply(ctx.t('errors-something-went-wrong'))
      this.logger.error({ error, userId: user.id }, 'Failed to get user readings')
      return null
    }

    return response.data
  }

  /**
   * Get available tarot spreads
   */
  public async getSpreads(
    ctx: Context,
  ): Promise<TarotRepositoryDTO.TarotSpreadDefinitionDTO[] | null> {
    const [error, spreads] = await safeAsync(
      this.tarotRepository.getSpreads(),
    )

    if (error) {
      await ctx.reply(ctx.t('errors-something-went-wrong'))
      this.logger.error({ error }, 'Failed to get tarot spreads')
      return null
    }

    return spreads
  }

  /**
   * Reply with a formatted tarot reading
   */
  public async replyWithReading(
    ctx: Context,
    reading: TarotRepositoryDTO.TarotReadingResponseDTO,
  ): Promise<void> {
    const message = this.formatTarotReading(ctx, reading)
    await ctx.safeReplyMarkdown(message)
  }

  /**
   * Format a tarot reading for display
   */
  private formatTarotReading(
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

  private isNotFoundApiError(error: unknown): boolean {
    if (!(error instanceof ApiDataError)) {
      return false
    }

    return error.errors[0].additionalInfo.statusCode === NOT_FOUND_ERROR_INFO.code
  }

  private isQuotaLimitError(error: unknown): boolean {
    if (!(error instanceof ApiDataError)) {
      return false
    }

    return error.errors[0].additionalInfo.statusCode === FORBIDDEN_ERROR_INFO.code
  }

  private isBadRequestError(error: unknown): boolean {
    if (!(error instanceof ApiDataError)) {
      return false
    }

    return error.errors[0].additionalInfo.statusCode === BAD_REQUEST_ERROR_INFO.code
  }

  private getErrorMessage(error: unknown): string | null {
    if (!(error instanceof ApiDataError)) {
      return null
    }

    return error.errors[0].message
  }
}

export function createTarotService(): TarotService {
  return new TarotService(tarotRepository, logger)
}
