import { InlineKeyboard } from 'grammy'

import type { Context } from '#root/bot/context.js'
import type { Logger } from '#root/shared/logger.js'
import type { NatalChartCompatibilitiesRepositoryDTO } from '#root/data/index.js'
import type { NatalChartCompatibilitiesRepository } from '#root/data/repositories/natal-chart-compatibilities-repository/natal-chart-compatibilities-repository.js'

import { logger } from '#root/shared/logger.js'
import { safeAsync } from '#root/shared/index.js'
import { FORBIDDEN_ERROR_INFO } from '#root/shared/http/index.js'
import { ApiDataError } from '#root/shared/api-client/error/index.js'
import { natalChartCompatibilitiesRepository } from '#root/data/repositories/natal-chart-compatibilities-repository/natal-chart-compatibilities-repository.js'

export class CompatibilitiesService {
  constructor(
    private readonly natalChartCompatibilitiesRepository: NatalChartCompatibilitiesRepository,
    private readonly logger: Logger,
  ) { }

  public async replyWithUserGuestCompatibility(
    ctx: Context,
    dto: NatalChartCompatibilitiesRepositoryDTO.CreateCompatibilityUserGuestRequestDTO,
    isOpen = false,
  ): Promise<void> {
    const fetchingMessage = await ctx.reply(ctx.t('fetching'), { reply_markup: { remove_keyboard: true } })

    const [compatibilityError, compatibility] = await safeAsync(
      this.natalChartCompatibilitiesRepository.createForUserWithGuest(dto),
    )

    if (compatibilityError && !this.isQuotaLimitError(compatibilityError)) {
      await fetchingMessage.delete()
      await ctx.reply(ctx.t('errors-something-went-wrong'))
      return
    }

    if (this.isQuotaLimitError(compatibilityError)) {
      // TODO: возможно лучше выводить ошибку с бэка, с форматированным временем окончания лимита
      await fetchingMessage.delete()
      await ctx.reply(ctx.t('error-quota-limit'))
      return
    }

    if (!compatibility) {
      await fetchingMessage.delete()
      await ctx.reply(ctx.t('error-quota-limit'))
      return
    }

    // Сохраняем interpretation в session для последующего открытия
    if (!isOpen) {
      ctx.session.lastCompatibilityInterpretation = compatibility.interpretation
    }

    const formattedInterpretation = this.formatInterpretation(ctx, compatibility.interpretation, isOpen)

    const keyboard = isOpen
      ? undefined
      : new InlineKeyboard().text(ctx.t('compatibilities-button-unlock-full'), `compatibility:unlock`)
    await ctx.reply(formattedInterpretation, {
      reply_markup: keyboard,
      parse_mode: 'HTML',
    })
  }

  private formatInterpretation(
    ctx: Context,
    interpretation: NatalChartCompatibilitiesRepositoryDTO.NatalChartCompatibilityInterpretation,
    isOpen: boolean,
  ): string {
    const lockedMessage = ctx.t('compatibilities-premium-section-locked')

    const sections = [
      this.formatSectionWithHeader(ctx, 'compatibilities-section-introduction', interpretation.introduction, false, isOpen, lockedMessage),
      this.formatSectionWithHeader(ctx, 'compatibilities-section-profiles', interpretation.profiles, false, isOpen, lockedMessage),
      this.formatSectionWithHeader(ctx, 'compatibilities-section-element-balance', interpretation.element_balance, false, isOpen, lockedMessage),
      this.formatSectionWithHeader(ctx, 'compatibilities-section-tense-aspects', interpretation.tense_aspects, false, isOpen, lockedMessage),
      this.formatSectionWithHeader(ctx, 'compatibilities-section-harmonious-aspects', interpretation.harmonious_aspects, false, isOpen, lockedMessage),
      this.formatSectionWithHeader(ctx, 'compatibilities-section-house-overlays', interpretation.house_overlays, false, isOpen, lockedMessage),
      this.formatSectionWithHeader(ctx, 'compatibilities-section-intimacy', interpretation.intimacy, true, isOpen, lockedMessage),
      this.formatSectionWithHeader(ctx, 'compatibilities-section-finances', interpretation.finances, true, isOpen, lockedMessage),
      this.formatSectionWithHeader(ctx, 'compatibilities-section-infidelity', interpretation.infidelity, true, isOpen, lockedMessage),
      this.formatSectionWithHeader(ctx, 'compatibilities-section-composite-chart', interpretation.composite_chart, false, isOpen, lockedMessage),
      this.formatSectionWithHeader(ctx, 'compatibilities-section-conclusions', interpretation.conclusions_and_recommendations, false, isOpen, lockedMessage),
    ]

    return sections.filter(section => section && section.trim()).join('\n\n')
  }

  private formatSectionWithHeader(
    ctx: Context,
    headerKey: string,
    content: string,
    isPremium: boolean,
    isOpen: boolean,
    lockedMessage: string,
  ): string {
    const header = `<b>${ctx.t(headerKey)}</b>`

    if (!content || !content.trim()) {
      return ''
    }

    if (isPremium && !isOpen) {
      return `${header}\n\n<tg-spoiler>${lockedMessage}</tg-spoiler>`
    }

    return `${header}\n\n${content}`
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

  public async unlockFullCompatibility(ctx: Context): Promise<void> {
    // TODO: Здесь нужно будет добавить проверку на оплату/подписку
    // Пока что открываем полную версию для всех

    const interpretation = ctx.session.lastCompatibilityInterpretation

    if (!interpretation) {
      await ctx.answerCallbackQuery(ctx.t('errors-something-went-wrong'))
      return
    }

    const formattedInterpretation = this.formatInterpretation(
      ctx,
      interpretation,
      true, // isOpen = true для открытия полной версии
    )

    try {
      await ctx.editMessageText(formattedInterpretation, {
        parse_mode: 'HTML',
      })
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

  public async getCompatibilityById(ctx: Context, id: string, isOpen = false) {
    const fetchingMessage = await ctx.reply(ctx.t('fetching'), { reply_markup: { remove_keyboard: true } })

    const [error, compatibility] = await safeAsync(
      this.natalChartCompatibilitiesRepository.findById(id),
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

    const formattedInterpretation = this.formatInterpretation(ctx, compatibility.interpretation, isOpen)

    return formattedInterpretation

    // const keyboard = isOpen
    //   ? undefined
    //   : new InlineKeyboard().text(ctx.t('compatibilities-button-unlock-full'), `compatibility:unlock`)
    // await fetchingMessage.editText(formattedInterpretation, {
    //   reply_markup: keyboard,
    //   parse_mode: 'HTML',
    // })
  }
}

export function createCompatibilitiesService(): CompatibilitiesService {
  return new CompatibilitiesService(natalChartCompatibilitiesRepository, logger)
}
