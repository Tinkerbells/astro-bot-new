import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
import { Expose, plainToInstance, Transform } from 'class-transformer'
import { IsNotEmpty, IsOptional, IsString, Matches, validateOrReject } from 'class-validator'

import type { Context } from '#root/bot/context.js'

dayjs.extend(customParseFormat)

type FormValidateResult<T> = { ok: false } | { ok: true, value: T }

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
   * Создает FormBuilder для использования с conversation.form.build()
   */
  static toFormBuilder() {
    return {
      collationKey: 'form-birth-time',
      validate: async (ctx: Context): Promise<FormValidateResult<string | null>> => {
        const text = (ctx.message ?? ctx.channelPost)?.text
        if (!text)
          return { ok: false }

        try {
          const step = plainToInstance(BirthTimeStep, { birthTime: text })
          await validateOrReject(step)

          return { ok: true, value: step.birthTime || null }
        }
        catch (err) {
          ctx.logger.error(err)
          return { ok: false }
        }
      },
      otherwise: async (ctx: Context) => {
        await ctx.reply(ctx.t('onboarding-birth-time-invalid'))
      },
    }
  }
}
