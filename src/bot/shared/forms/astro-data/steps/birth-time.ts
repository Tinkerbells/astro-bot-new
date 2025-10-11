import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
import { Expose, plainToInstance, Transform } from 'class-transformer'
import { IsNotEmpty, IsOptional, IsString, Matches, validateOrReject } from 'class-validator'

import type { Context } from '#root/bot/context.js'
import type { FormValidateResult } from '#root/bot/shared/helpers/form.js'

dayjs.extend(customParseFormat)

/**
 * Form step для валидации и обработки времени рождения
 *
 * Принимает время в форматах:
 * - HH:MM (14:30, 09:05)
 * - HH-MM (14-30, 09-05)
 * - HH.MM (14.30, 09.05)
 * - H:MM (9:05)
 *
 * Возвращает время в формате HH:MM (24-часовой)
 *
 * Поддерживает два режима:
 * - **Обязательный** (toRequiredFormBuilder) - для астро-данных гостя
 * - **Опциональный** (toOptionalFormBuilder) - для onboarding с кнопкой "Пропустить"
 *
 * @example
 * ```ts
 * // Обязательное время
 * const birthTime = await conversation.form.build(
 *   BirthTimeStep.toRequiredFormBuilder(ctx.t('error-invalid-time'))
 * )
 * // birthTime: '14:30'
 *
 * // Опциональное время (с buildOptionalField)
 * const birthTime = await buildOptionalField<string>(
 *   conversation,
 *   BirthTimeStep.toOptionalFormBuilder(ctx.t('error-invalid-time')),
 *   { skipCallbackData: 'skip_birth_time' }
 * )
 * // birthTime: '14:30' | null
 * ```
 */
export class BirthTimeStep {
  @Expose()
  @IsOptional()
  @Transform(({ value }) => BirthTimeStep.parseBirthTimeInput(value), { toClassOnly: true })
  @IsNotEmpty()
  @IsString()
  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/, {
    message: 'Время рождения должно быть в формате ЧЧ:ММ и быть корректным временем',
  })
  birthTime: string | null

  static parseBirthTimeInput(birthTime?: string): string | undefined {
    if (!birthTime)
      return undefined

    const trimmed = birthTime.trim()
    if (!trimmed)
      return undefined

    const sanitized = trimmed.replace(/[.\-]/g, ':')
    const timeFormats = ['H:mm', 'HH:mm']

    for (const format of timeFormats) {
      const parsed = dayjs(sanitized, format, true)
      if (parsed.isValid())
        return parsed.format('HH:mm')
    }

    return undefined
  }

  /**
   * Создает FormBuilder для обязательного времени рождения (для астро-данных гостя)
   *
   * Время должно быть указано обязательно, нет возможности пропустить.
   * Используется для natal charts, ascendant и других расчетов требующих точное время.
   *
   * @param errorMessage - Сообщение об ошибке при невалидном времени
   * @returns FormBuilder для валидации обязательного времени
   *
   * @example
   * ```ts
   * const birthTime = await conversation.form.build(
   *   BirthTimeStep.toRequiredFormBuilder(ctx.t('astro-data-birth-time-invalid'))
   * )
   * // birthTime всегда string: '14:30'
   * ```
   */
  static toRequiredFormBuilder(errorMessage: string) {
    return {
      collationKey: 'form-birth-time-required',
      validate: async (ctx: Context): Promise<FormValidateResult<string>> => {
        const text = (ctx.message ?? ctx.channelPost)?.text
        if (!text)
          return { ok: false, error: 'No text message' }

        try {
          const step = plainToInstance(BirthTimeStep, { birthTime: text })
          await validateOrReject(step)

          if (!step.birthTime)
            return { ok: false, error: 'Birth time is required' }

          return { ok: true, value: step.birthTime }
        }
        catch (err) {
          ctx.logger.error({ error: err }, 'Birth time validation failed')
          return { ok: false, error: err }
        }
      },
      otherwise: async (ctx: Context) => {
        await ctx.reply(errorMessage)
      },
    }
  }

  /**
   * Создает FormBuilder для опционального времени рождения (для onboarding)
   *
   * Время можно пропустить, нажав кнопку "Пропустить".
   * Используется с buildOptionalField() helper.
   * Если пользователь пропускает, возвращается null.
   *
   * @param errorMessage - Сообщение об ошибке при невалидном времени
   * @returns FormBuilder для валидации опционального времени
   *
   * @example
   * ```ts
   * // Показать кнопку "Пропустить"
   * await ctx.reply(ctx.t('birth-time-prompt'), {
   *   reply_markup: createBirthTimeSkipKeyboard(ctx, 'skip_birth_time')
   * })
   *
   * const birthTime = await buildOptionalField<string>(
   *   conversation,
   *   BirthTimeStep.toOptionalFormBuilder(ctx.t('astro-data-birth-time-invalid')),
   *   { skipCallbackData: 'skip_birth_time' }
   * )
   * // birthTime: '14:30' | null
   * ```
   */
  static toOptionalFormBuilder(errorMessage: string) {
    return {
      collationKey: 'form-birth-time-optional',
      validate: async (ctx: Context): Promise<FormValidateResult<string>> => {
        const text = (ctx.message ?? ctx.channelPost)?.text
        if (!text)
          return { ok: false, error: 'No text message' }

        try {
          const step = plainToInstance(BirthTimeStep, { birthTime: text })
          await validateOrReject(step)

          if (!step.birthTime)
            return { ok: false, error: 'Birth time is required' }

          return { ok: true, value: step.birthTime }
        }
        catch (err) {
          ctx.logger.error({ error: err }, 'Birth time validation failed')
          return { ok: false, error: err }
        }
      },
      otherwise: async (ctx: Context) => {
        await ctx.reply(errorMessage)
      },
    }
  }
}
