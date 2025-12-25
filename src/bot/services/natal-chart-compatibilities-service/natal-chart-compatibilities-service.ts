import type { Context } from '#root/bot/context.js'
import type { Logger } from '#root/shared/logger.js'
import type { NatalChartCompatibilitiesRepositoryDTO } from '#root/data/index.js'
import type { NatalChartCompatibilitiesRepository } from '#root/data/repositories/natal-chart-compatibilities-repository/natal-chart-compatibilities-repository.js'

import { logger } from '#root/shared/logger.js'
import { safeAsync } from '#root/shared/index.js'
import { NOT_FOUND_HTTP_CODE } from '#root/shared/http/net-error.js'
import { ApiDataError } from '#root/shared/api-client/error/index.js'
import { isInsufficientFundsErrorLike } from '#root/shared/http/index.js'
import { natalChartCompatibilitiesRepository } from '#root/data/repositories/natal-chart-compatibilities-repository/natal-chart-compatibilities-repository.js'

export class CompatibilitiesService {
  constructor(
    private readonly natalChartCompatibilitiesRepository: NatalChartCompatibilitiesRepository,
    private readonly logger: Logger,
  ) { }

  public async replyWithUserGuestCompatibility(
    ctx: Context,
    dto: NatalChartCompatibilitiesRepositoryDTO.CreateCompatibilityUserGuestRequestDTO,
  ): Promise<void> {
    const fetchingMessage = await ctx.reply(ctx.t('fetching'), { reply_markup: { remove_keyboard: true } })

    const [compatibilityError, compatibility] = await safeAsync(
      this.natalChartCompatibilitiesRepository.createForUserWithGuest(dto),
    )

    if (compatibilityError) {
      await fetchingMessage.delete()
      if (isInsufficientFundsErrorLike(compatibilityError)) {
        await ctx.reply(ctx.t('error-insufficient-funds'))
        return
      }

      await ctx.reply(ctx.t('errors-something-went-wrong'))
      return
    }

    if (!compatibility) {
      await fetchingMessage.delete()
      await ctx.reply(ctx.t('errors-something-went-wrong'))
      return
    }

    const summary = compatibility.summary
    if (!summary) {
      await fetchingMessage.delete()
      await ctx.reply(ctx.t('errors-something-went-wrong'))
      return
    }
    ctx.session.lastCompatibilitySummary = summary
    await fetchingMessage.delete()
    await ctx.safeReplyMarkdown(summary, { reply_markup: { remove_keyboard: true } })
  }

  public async replyWithCompatibilityBySocialName(
    ctx: Context,
    dto: NatalChartCompatibilitiesRepositoryDTO.CreateCompatibilityBySocialNameRequestDTO,
  ): Promise<void> {
    const fetchingMessage = await ctx.reply(ctx.t('fetching'), { reply_markup: { remove_keyboard: true } })

    const [compatibilityError, compatibility] = await safeAsync(
      this.natalChartCompatibilitiesRepository.createBySocialName(dto),
    )

    if (compatibilityError) {
      await fetchingMessage.delete()

      if (isInsufficientFundsErrorLike(compatibilityError)) {
        await ctx.reply(ctx.t('error-insufficient-funds'))
        return
      }

      if (this.isNotFoundError(compatibilityError)) {
        await ctx.reply(this.getNotFoundMessage(compatibilityError) || ctx.t('errors-something-went-wrong'))
        return
      }

      await ctx.reply(ctx.t('errors-something-went-wrong'))
      return
    }

    if (!compatibility) {
      await fetchingMessage.delete()
      await ctx.reply(ctx.t('errors-something-went-wrong'))
      return
    }

    const summary = compatibility.summary
    if (!summary) {
      await fetchingMessage.delete()
      await ctx.reply(ctx.t('errors-something-went-wrong'))
      return
    }
    ctx.session.lastCompatibilitySummary = summary
    await fetchingMessage.delete()
    await ctx.safeReplyMarkdown(summary, { reply_markup: { remove_keyboard: true } })
  }

  private isNotFoundError(error: unknown): boolean {
    if (!(error instanceof ApiDataError)) {
      return false
    }

    return error.errors[0].additionalInfo.statusCode === NOT_FOUND_HTTP_CODE
  }

  private getNotFoundMessage(error: unknown): string | null {
    if (!(error instanceof ApiDataError)) {
      return null
    }

    if (!this.isNotFoundError(error)) {
      return null
    }

    return error.errors[0].message
  }

  public async unlockFullCompatibility(ctx: Context): Promise<void> {
    const summary = ctx.session.lastCompatibilitySummary

    if (!summary) {
      await ctx.answerCallbackQuery(ctx.t('errors-something-went-wrong'))
      return
    }

    try {
      await ctx.safeEditMarkdownMessage(summary)
      await ctx.answerCallbackQuery()
    }
    catch (error) {
      this.logger.error({ err: error }, 'Failed to unlock full compatibility')
      await ctx.answerCallbackQuery(ctx.t('errors-something-went-wrong'))
    }
  }

  public async getUserCompatibilities(ctx: Context) {
    const user = ctx.session.user

    const [error, result] = await safeAsync(
      this.natalChartCompatibilitiesRepository.findAllByUserId(Number(user.id), { page: 1, limit: 10 }),
    )

    if (error) {
      this.logger.error({ err: error })
      throw error
    }

    if (!result || result.data.length === 0) {
      return null
    }

    return result.data
  }

  public async getCompatibilityById(ctx: Context, id: string) {
    const fetchingMessage = await ctx.reply(ctx.t('fetching'), { reply_markup: { remove_keyboard: true } })

    const userId = Number(ctx.session.user.id)

    const [error, compatibility] = await safeAsync(
      this.natalChartCompatibilitiesRepository.findById(id, userId),
    )

    if (error) {
      await fetchingMessage.delete()
      await ctx.reply(ctx.t('errors-something-went-wrong'))
      this.logger.error({ err: error })
      return null
    }

    if (!compatibility) {
      await fetchingMessage.delete()
      await ctx.reply(ctx.t('errors-something-went-wrong'))
      return null
    }

    await fetchingMessage.delete()

    const summary = compatibility.summary
    if (!summary) {
      await ctx.reply(ctx.t('errors-something-went-wrong'))
      return null
    }
    ctx.session.lastCompatibilitySummary = summary
    return summary
  }
}

export function createCompatibilitiesService(): CompatibilitiesService {
  return new CompatibilitiesService(natalChartCompatibilitiesRepository, logger)
}
