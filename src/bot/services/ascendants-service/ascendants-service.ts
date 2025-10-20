import type { Context } from '#root/bot/context.js'
import type { Logger } from '#root/shared/logger.js'
import type { AscendantsRepositoryDTO } from '#root/data/index.js'
import type { AscendantsRepository } from '#root/data/repositories/ascendants-repository/ascendants-repository.js'

import { logger } from '#root/shared/logger.js'
import { safeAsync } from '#root/shared/index.js'
import { ApiDataError } from '#root/shared/api-client/error/index.js'
import { FORBIDDEN_ERROR_INFO, NOT_FOUND_ERROR_INFO } from '#root/shared/http/index.js'
import { ascendantsRepository } from '#root/data/repositories/ascendants-repository/ascendants-repository.js'

export class AscendantsService {
  constructor(
    private readonly ascendantsRepository: AscendantsRepository,
    private readonly logger: Logger,
  ) { }

  public async getUserAscendant(
    ctx: Context,
  ) {
    const user = ctx.session.user

    const fetchingMessage = await ctx.reply(ctx.t('fetching'), { reply_markup: { remove_keyboard: true } })

    const [userAscendantsError, userAscendants] = await safeAsync(this.ascendantsRepository.findByUserId({ userId: Number(user.id) }))

    if (userAscendantsError && !this.isNotFoundApiError(userAscendantsError)) {
      await fetchingMessage.delete()
      await ctx.reply(ctx.t('errors-something-went-wrong'))
      return
    }

    const userAscendant = userAscendants && userAscendants.length > 0 ? userAscendants[0] : null

    if (userAscendant) {
      await fetchingMessage.delete()
      return userAscendant.interpretation
    }

    const [generateForUserError, generatedUserAscendant] = await safeAsync(this.ascendantsRepository.generateForUser({ userId: Number(user.id) }))

    if (generateForUserError && !this.isQuotaLimitError(generateForUserError)) {
      await fetchingMessage.delete()
      await ctx.reply(ctx.t('errors-something-went-wrong'))
      return
    }

    if (this.isQuotaLimitError(generateForUserError)) {
      // TODO: возможно лучше выводить ошибку с бэка, с форматированным временем окончания лимита
      await fetchingMessage.delete()
      await ctx.reply(ctx.t('error-quota-limit'))
      return null
    }

    if (!generatedUserAscendant) {
      await fetchingMessage.delete()
      await ctx.reply(ctx.t('errors-something-went-wrong'))
      return null
    }

    return generatedUserAscendant.interpretation
  }

  // TODO: полностью неправильно, нужно отдельно брать информацию про guest пользователя, а не исползовать ctx.session.user
  public async replyWithGuestAscendant(ctx: Context, dto: AscendantsRepositoryDTO.GenerateGuestDTO): Promise<void> {
    const fetchingMessage = await ctx.reply(ctx.t('fetching'), { reply_markup: { remove_keyboard: true } })

    const [guestAscendantError, guestAscendant] = await safeAsync(this.ascendantsRepository.generateGuest(dto))

    if (guestAscendantError && !this.isQuotaLimitError(guestAscendantError)) {
      await fetchingMessage.delete()
      await ctx.reply(ctx.t('errors-something-went-wrong'))
      return
    }

    if (this.isQuotaLimitError(guestAscendantError)) {
      // TODO: возможно лучше выводить ошибку с бэка, с форматированным временем окончания лимита
      await fetchingMessage.delete()
      await ctx.reply(ctx.t('error-quota-limit'))
      return
    }

    if (!guestAscendant) {
      await fetchingMessage.delete()
      await ctx.reply(ctx.t('errors-something-went-wrong'))
      return
    }

    await ctx.safeReplyMarkdown(guestAscendant.interpretation, { reply_markup: { remove_keyboard: true } })
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

export function createAscendantsService(): AscendantsService {
  return new AscendantsService(ascendantsRepository, logger)
}
