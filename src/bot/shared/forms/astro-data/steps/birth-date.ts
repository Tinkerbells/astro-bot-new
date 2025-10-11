import type { FormBuilder } from '@grammyjs/conversations'

import { Expose, plainToInstance, Transform } from 'class-transformer'
import { IsNotEmpty, IsString, Matches, validateOrReject } from 'class-validator'

import type { Context } from '#root/bot/context.js'
import type { FormValidateResult } from '#root/bot/shared/helpers/form.js'

import { parseBirthDateInput } from '#root/shared/utils/astro/index.js'

/**
 * Form step для валидации и обработки даты рождения
 *
 * Принимает даты в форматах:
 * - DD.MM.YYYY (15.06.1990)
 * - DD-MM-YYYY (15-06-1990)
 * - DD/MM/YYYY (15/06/1990)
 * - YYYY-MM-DD (1990-06-15)
 *
 * Возвращает дату в формате ISO: YYYY-MM-DD
 *
 * @example
 * ```ts
 * const birthDate = await conversation.form.build(
 *   BirthDateStep.toFormBuilder(ctx.t('error-invalid-date'))
 * )
 * // birthDate: '1990-06-15'
 * ```
 */
export class BirthDateStep {
  @Expose()
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => parseBirthDateInput(value), { toClassOnly: true })
  @Matches(/^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/, {
    message: 'Дата рождения должна быть в формате ДД.ММ.ГГГГ или ДД-ММ-ГГГГ и быть корректной датой',
  })
  birthDate!: string

  /**
   * Создает FormBuilder для использования с conversation.form.build()
   *
   * @param errorMessage - Сообщение об ошибке при невалидной дате
   * @returns FormBuilder для валидации даты рождения
   *
   * @example
   * ```ts
   * const birthDate = await conversation.form.build(
   *   BirthDateStep.toFormBuilder(ctx.t('astro-data-birth-date-invalid'))
   * )
   * ```
   */
  static toFormBuilder(errorMessage: string): FormBuilder<Context, string> {
    return {
      collationKey: 'form-birth-date',
      validate: async (ctx: Context): Promise<FormValidateResult<string>> => {
        const text = (ctx.message ?? ctx.channelPost)?.text
        if (!text)
          return { ok: false, error: 'No text message' }

        try {
          const step = plainToInstance(BirthDateStep, { birthDate: text })
          await validateOrReject(step)

          return { ok: true, value: step.birthDate }
        }
        catch (err) {
          return { ok: false, error: err }
        }
      },
      otherwise: async (ctx: Context) => {
        await ctx.reply(errorMessage)
      },
    }
  }
}
