import dayjs from 'dayjs'
import { plainToInstance } from 'class-transformer'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
import { IsOptional, IsString, Matches, validateOrReject } from 'class-validator'

import type { Context } from '#root/bot/context.js'
import type { FormValidateResult } from '#root/bot/shared/helpers/form.js'

import type { FormStepFactory } from '../form-step.js'

import { formStep } from '../form-step.js'
import { SkipPlugin } from '../plugins/skip.js'
import { CancelPlugin } from '../plugins/cancel.js'

type BirthTimeStepOptions = {
  conversationId: string
  canSkip?: boolean
  onCancel?: (ctx: Context) => Promise<void> | void
}

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

function createBirthTimeStep(options: BirthTimeStepOptions): FormStepFactory<Context, string, string | null> {
  const canSkip = options.canSkip ?? false
  return formStep<Context>()({
    stepId: 'birthTime',
    plugins: [
      new SkipPlugin<Context>({
        text: 'skip',
        callbackData: 'skip_birth_time',
        skipResult: () => ({ ok: true, value: null }),
      }),
      new CancelPlugin<Context>({
        callbackData: 'cancel_birth_time',
        conversationId: options.conversationId,
        onCancel: options.onCancel,
      }),
    ],

    async validate(input) {
      if (!input)
        throw new Error('Время рождения не указано')

      await validateBirthTime(input)
    },

    async prompt({ ctx, plugins }) {
      if (canSkip) {
        const skipKeyboard = plugins.get('skip').createKeyboard()
        const cancelKeyboard = plugins.get('cancel').createKeyboard()
        skipKeyboard.inline_keyboard.push(...cancelKeyboard.inline_keyboard)

        await ctx.safeReply(ctx.t('astro-data-birth-time'), { reply_markup: skipKeyboard })
      }
      else {
        await ctx.safeReply(ctx.t('astro-data-birth-time'), {
          reply_markup: plugins.get('cancel').createKeyboard(),
        })
      }
    },

    async build({ ctx, form, validate, prompt, plugins }) {
      const skipPlugin = plugins.get('skip')
      const cancelPlugin = plugins.get('cancel')

      skipPlugin.setButton(ctx.t('skip'))
      cancelPlugin.setButton(ctx.t('cancel'))
      if (options.onCancel) {
        cancelPlugin.setOnCancel(options.onCancel)
      }

      await prompt()

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
          if (canSkip) {
            const skipKeyboard = skipPlugin.createKeyboard()
            skipKeyboard.inline_keyboard.push(...cancelPlugin.createKeyboard().inline_keyboard)
            await ctx.safeReply(ctx.t('astro-data-birth-time-invalid'), { reply_markup: skipKeyboard })
          }
          else {
            await ctx.safeReply(ctx.t('astro-data-birth-time-invalid'), {
              reply_markup: cancelPlugin.createKeyboard(),
            })
          }
        },
      })
      return birthTime
    },
  })
}

export const birthTimeStep = (options: BirthTimeStepOptions) => createBirthTimeStep(options)
