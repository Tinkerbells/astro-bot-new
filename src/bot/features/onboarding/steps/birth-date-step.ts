import { Expose, plainToInstance, Transform } from 'class-transformer'
import { IsNotEmpty, IsString, Matches, validateOrReject } from 'class-validator'

import type { Context } from '#root/bot/context.js'

import { parseBirthDateInput } from '../utils/date-utils.js'

type FormValidateResult<T> = { ok: false } | { ok: true, value: T }

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
   */
  static toFormBuilder() {
    return {
      collationKey: 'form-birth-date',
      validate: async (ctx: Context): Promise<FormValidateResult<string>> => {
        const text = (ctx.message ?? ctx.channelPost)?.text
        if (!text)
          return { ok: false }

        try {
          const step = plainToInstance(BirthDateStep, { birthDate: text })
          await validateOrReject(step)

          return { ok: true, value: step.birthDate }
        }
        catch (err) {
          ctx.logger.error(err)
          return { ok: false }
        }
      },
      action: async (ctx: Context) => {
        await ctx.reply(ctx.t('onboarding-birth-date-received'))
      },
      otherwise: async (ctx: Context) => {
        await ctx.reply(ctx.t('onboarding-birth-date-invalid'))
      },
    }
  }
}
