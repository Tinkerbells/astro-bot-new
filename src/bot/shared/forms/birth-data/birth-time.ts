import dayjs from 'dayjs'
import { plainToInstance } from 'class-transformer'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
import { IsOptional, IsString, Matches, validateOrReject } from 'class-validator'

import type { Context } from '#root/bot/context.js'
import type { FormValidateResult } from '#root/bot/shared/helpers/form.js'

import type { FormStepFactory } from '../form-step.js'

import { formStep } from '../form-step.js'
import { SkipPlugin } from '../plugins/skip.js'

dayjs.extend(customParseFormat)

class BirthTime {
  @IsOptional()
  @IsString()
  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/u, {
    message: 'Время рождения должно быть в формате ЧЧ:ММ и быть корректным временем',
  })
  public birthTime: string | null
}

function parseBirthTimeInput(value?: string): string | undefined {
  if (!value)
    return undefined

  const trimmed = value.trim()
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

async function validateBirthTime(value: string): Promise<void> {
  const instance = plainToInstance(BirthTime, { birthTime: value })
  await validateOrReject(instance)
}

function createBirthTimeStep(): FormStepFactory<Context, string, string | null> {
  return formStep<Context>()({
    stepId: 'birthTime',
    plugins: [
      new SkipPlugin<Context>({
        text: 'skip',
        callbackData: 'skip_birth_time',
        skipResult: () => ({ ok: true, value: null }),
      }),
    ],

    async validate(input) {
      if (!input)
        throw new Error('Время рождения не указано')

      await validateBirthTime(input)
    },

    async prompt({ ctx, plugins }) {
      await ctx.safeReply(ctx.t('astro-data-birth-time'), { reply_markup: plugins.get('skip').createKeyboard() })
    },

    async build({ ctx, form, validate, prompt, plugins }) {
      await prompt()

      plugins.get('skip').setButton(ctx.t('skip'))

      const birthTime = await form.build<string | null>({
        collationKey: 'form-birth-time',
        validate: async (ctx): Promise<FormValidateResult<string | null>> => {
          const text = (ctx.message ?? ctx.channelPost)?.text
          if (!text)
            return { ok: false, error: new Error('No text message') }

          const parsed = parseBirthTimeInput(text)
          if (!parsed)
            return { ok: false, error: new Error('Invalid birth time format') }

          try {
            await validate(parsed)
            return { ok: true, value: parsed }
          }
          catch (error) {
            return { ok: false, error }
          }
        },
        otherwise: async (ctx: Context) => {
          await ctx.safeReply(ctx.t('astro-data-birth-time-invalid'), { reply_markup: plugins.get('skip').createKeyboard() })
        },
      })
      return birthTime
    },
  })
}

export const birthTimeStep = createBirthTimeStep()
