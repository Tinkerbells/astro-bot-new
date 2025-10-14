import { plainToInstance } from 'class-transformer'
import { IsNotEmpty, IsString, Matches, validateOrReject } from 'class-validator'

import type { Context } from '#root/bot/context.js'
import type { FormValidateResult } from '#root/bot/shared/helpers/form.js'

import { parseBirthDateInput } from '#root/shared/utils/astro/index.js'

import type { FormStepFactory } from '../form-step.js'

import { formStep } from '../form-step.js'
import { CancelPlugin } from '../plugins/cancel.js'

type BirthDateStepOptions = {
  conversationId: string
  onCancel?: (ctx: Context) => Promise<void> | void
}

class BirthDate {
  @IsNotEmpty({ message: 'Дата рождения обязательна' })
  @IsString({ message: 'Дата рождения должна быть строкой' })
  @Matches(/^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/u, {
    message: 'Дата рождения должна быть в формате ГГГГ-ММ-ДД',
  })
  public birthDate: string
}

async function validateBirthDate(value: string): Promise<void> {
  const instance = plainToInstance(BirthDate, { birthDate: value })
  await validateOrReject(instance)
}

function createBirthDateStep(options: BirthDateStepOptions): FormStepFactory<Context, string, string | null> {
  return formStep<Context>()({
    stepId: 'birthDate',
    plugins: [
      new CancelPlugin<Context>({
        callbackData: 'cancel_birth_date',
        conversationId: options.conversationId,
        onCancel: options.onCancel,
      }),
    ],

    async validate(input) {
      if (!input)
        throw new Error('Дата рождения не указана')

      await validateBirthDate(input)
    },

    async prompt({ ctx, plugins }) {
      await ctx.reply(ctx.t('astro-data-birth-date'), {
        reply_markup: plugins.get('cancel').createKeyboard(),
      })
    },

    async build({ ctx, form, validate, prompt, plugins }) {
      const cancelPlugin = plugins.get('cancel')
      cancelPlugin.setButton(ctx.t('cancel'))
      if (options.onCancel) {
        cancelPlugin.setOnCancel(options.onCancel)
      }

      await prompt()

      const birthDate = await form.build<string | null>({
        collationKey: 'form-birth-date',
        validate: async (ctx): Promise<FormValidateResult<string | null>> => {
          const text = (ctx.message ?? ctx.channelPost)?.text
          if (!text)
            return { ok: false, error: new Error('No text message') }

          const parsed = parseBirthDateInput(text)
          if (!parsed)
            return { ok: false, error: new Error('Invalid birth date format') }

          try {
            await validate(parsed)
            return { ok: true, value: parsed }
          }
          catch (error) {
            return { ok: false, error }
          }
        },
        otherwise: async (ctx: Context) => {
          await ctx.reply(ctx.t('astro-data-birth-date-invalid'), {
            reply_markup: cancelPlugin.createKeyboard(),
          })
        },
      })

      return birthDate ?? null
    },
  })
}

export const birthDateStep = (options: BirthDateStepOptions) => createBirthDateStep(options)
