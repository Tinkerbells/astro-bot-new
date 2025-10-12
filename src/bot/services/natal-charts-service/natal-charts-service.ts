import type { Context } from '#root/bot/context.js'
import type { Logger } from '#root/shared/logger.js'
import type { User } from '#root/domain/entities/index.js'
import type { NatalChartsRepositoryDTO } from '#root/data/index.js'
import type { NatalChartsRepository } from '#root/data/repositories/natal-charts-repository/natal-charts-repository.js'

import { logger } from '#root/shared/logger.js'
import { safeAsync } from '#root/shared/index.js'
import { ApiDataError } from '#root/shared/api-client/error/index.js'
import { createProfileMessage } from '#root/bot/shared/menus/index.js'
import { FORBIDDEN_ERROR_INFO, NOT_FOUND_ERROR_INFO } from '#root/shared/http/index.js'
import { natalChartsRepository } from '#root/data/repositories/natal-charts-repository/natal-charts-repository.js'

export class NatalChartsService {
  constructor(
    private readonly natalChartsRepository: NatalChartsRepository,
    private readonly logger: Logger,
  ) { }

  public canGenerateUserChart(user: User): boolean {
    if (!user) {
      return false
    }

    return Boolean(
      user.birthDate
      && user.birthTime
      && user.timezone
      && user.latitude !== undefined
      && user.longitude !== undefined,
    )
  }

  public async replyWithUserNatalChart(
    ctx: Context,
  ) {
    const user = ctx.session.user

    const fetchingMessage = await ctx.reply(ctx.t('fetching'))

    const [userNatalChartError, userNatalChart] = await safeAsync(this.natalChartsRepository.getLatestForUser({ userId: Number(user.id) }))

    if (userNatalChartError && !this.isNotFoundApiError(userNatalChartError)) {
      await fetchingMessage.editText(ctx.t('errors-something-went-wrong'))
      return
    }

    if (userNatalChart) {
      await ctx.safeReplyMarkdown(userNatalChart.interpretation)
      return
    }

    if (!this.canGenerateUserChart(user)) {
      await fetchingMessage.editText(ctx.t('natal-charts-user-missing-data'))
      return
    }

    const [generateForUserError, generatedUserNatalChart] = await safeAsync(this.natalChartsRepository.generateForUser({ userId: Number(user.id) }))

    if (generateForUserError && !this.isQuotaLimitError(generateForUserError)) {
      await fetchingMessage.editText(ctx.t('errors-something-went-wrong'))
      return
    }

    if (this.isQuotaLimitError(generateForUserError)) {
      // TODO: возможно лучше выводить ошибку с бэка, с форматированным временем окончания лимита
      await fetchingMessage.editText(ctx.t('error-quota-limit'))
      return
    }

    if (!generatedUserNatalChart) {
      await fetchingMessage.editText(ctx.t('errors-something-went-wrong'))
      return
    }

    await ctx.safeReplyMarkdown(generatedUserNatalChart.interpretation)

    await createProfileMessage(ctx).send()
  }

  // TODO: полностью неправильно, нужно отдельно брать информацию про guest пользователя, а не исползовать ctx.session.user
  public async replyWithGuestNatalChart(ctx: Context, dto: NatalChartsRepositoryDTO.GenerateGuestDTO): Promise<void> {
    const fetchingMessage = await ctx.reply(ctx.t('fetching'))

    const [guestNatalChartError, guestNatalChart] = await safeAsync(this.natalChartsRepository.generateGuest(dto))

    if (guestNatalChartError && !this.isQuotaLimitError(guestNatalChartError)) {
      await fetchingMessage.editText(ctx.t('errors-something-went-wrong'))
      return
    }

    if (this.isQuotaLimitError(guestNatalChartError)) {
      // TODO: возможно лучше выводить ошибку с бэка, с форматированным временем окончания лимита
      await fetchingMessage.editText(ctx.t('error-quota-limit'))
      return
    }

    if (!guestNatalChart) {
      await fetchingMessage.editText(ctx.t('errors-something-went-wrong'))
      return
    }

    await ctx.safeReplyMarkdown(guestNatalChart.interpretation, { reply_markup: { remove_keyboard: true } })
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

  private getQuotaLimitMessage(error: unknown): string | null {
    if (!(error instanceof ApiDataError)) {
      return null
    }

    if (!this.isQuotaLimitError(error)) {
      return null
    }

    return error.errors[0].message
  }
}

export function createNatalChartsService(): NatalChartsService {
  return new NatalChartsService(natalChartsRepository, logger)
}
