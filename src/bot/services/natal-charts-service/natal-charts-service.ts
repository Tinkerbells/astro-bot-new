import type { Context } from '#root/bot/context.js'
import type { Logger } from '#root/shared/logger.js'
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

  private async sendProfileMenu(ctx: Context) {
    const message = createProfileMessage(ctx)
    await message.send()
  }

  public canGenerateUserChart(ctx: Context): boolean {
    const user = ctx.session.user
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
      await ctx.reply(ctx.t('errors-something-went-wrong'))
      return
    }

    if (userNatalChart) {
      await ctx.safeReplyMarkdown(userNatalChart.interpretation)
      this.sendProfileMenu(ctx)
      return
    }

    if (!this.canGenerateUserChart(ctx)) {
      await fetchingMessage.editText(ctx.t('natal-charts-user-missing-data'))
      return
    }

    const [generateForUserError, generatedUserNatalChart] = await safeAsync(this.natalChartsRepository.generateForUser({ userId: Number(user.id) }))

    if (generateForUserError && !this.isQuotaLimitError(generateForUserError)) {
      await ctx.reply(ctx.t('errors-something-went-wrong'))
      return
    }

    if (this.isQuotaLimitError(generateForUserError)) {
      // TODO: возможно лучше выводить ошибку с бэка, с форматированным временем окончания лимита
      await ctx.reply(ctx.t('error-quota-limit'))
    }

    if (!generatedUserNatalChart) {
      await ctx.reply(ctx.t('errors-something-went-wrong'))
      return
    }

    await ctx.safeReplyMarkdown(generatedUserNatalChart.interpretation)

    this.sendProfileMenu(ctx)
  }

  // TODO: полностью неправильно, нужно отдельно брать информацию про guest пользователя, а не исползовать ctx.session.user
  public async replyWithGuestNatalChart(ctx: Context): Promise<void> {
    const user = ctx.session.user

    if (!user?.birthDate || user.latitude === undefined || user.longitude === undefined) {
      await ctx.reply(ctx.t('natal-charts-guest-missing-data'))
      return
    }

    await ctx.reply(ctx.t('natal-charts-guest-generating'))

    // try {
    //   const guestChart = await this.generateGuestNatalChart({
    //     userId: Number(user.id),
    //     birthDateTime: this.buildBirthDateTime(user.birthDate, user.birthTime),
    //     latitude: user.latitude,
    //     longitude: user.longitude,
    //   })
    //
    //   await ctx.reply(ctx.t('natal-charts-guest-success'))
    //   await ctx.safeReplyMarkdown(guestChart.interpretation)
    // }
    // catch (error) {
    //   this.logger.error({ err: error }, 'Failed to generate guest natal chart')
    //
    //   if (this.isQuotaLimitError(error)) {
    //     const message = this.getQuotaLimitMessage(error) ?? ctx.t('error-quota-limit')
    //     await ctx.reply(message)
    //     return
    //   }
    //
    //   await ctx.reply(ctx.t('natal-charts-error'))
    // }
  }

  public buildBirthDateTime(birthDate: string, birthTime?: string): string {
    if (birthTime) {
      return `${birthDate}T${birthTime}:00`
    }

    return `${birthDate}T12:00:00`
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
