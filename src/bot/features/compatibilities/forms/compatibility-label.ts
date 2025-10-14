import { plainToInstance } from 'class-transformer'
import { IsNotEmpty, IsString, validateOrReject } from 'class-validator'

import type { Context } from '#root/bot/context.js'
import type { FormStepFactory } from '#root/bot/shared/forms/form-step.js'
import type { FormValidateResult } from '#root/bot/shared/helpers/form.js'

import { formStep } from '#root/bot/shared/forms/form-step.js'

class CompatibilityLabel {
  @IsNotEmpty()
  @IsString()
  public label: string
}

async function validateLabel(value: string): Promise<void> {
  const instance = plainToInstance(CompatibilityLabel, { label: value })
  await validateOrReject(instance)
}

function createCompatibilityLabelStep(): FormStepFactory<Context, string, string | null> {
  return formStep<Context>()({
    stepId: 'compatibilityLabel',

    async validate(input) {
      if (!input)
        throw new Error('Label не указан')

      await validateLabel(input)
    },

    async prompt({ ctx }) {
      // TODO: добавить i18n
      await ctx.reply('Введите имя партнера')
    },

    async build({ form, validate, prompt }) {
      await prompt()

      const label = await form.build<string | null>({
        collationKey: 'form-compatibility-label',
        validate: async (ctx): Promise<FormValidateResult<string | null>> => {
          const text = (ctx.message ?? ctx.channelPost)?.text
          if (!text)
            return { ok: false, error: new Error('No text message') }

          try {
            await validate(text)
            return { ok: true, value: text }
          }
          catch (error) {
            return { ok: false, error }
          }
        },
        otherwise: async (ctx: Context) => {
          await ctx.reply(ctx.t('astro-data-birth-date-invalid'))
        },
      })

      return label
    },
  })
}

export const compatibilityLabelStep = createCompatibilityLabelStep()
