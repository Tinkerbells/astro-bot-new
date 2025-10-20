import { plainToInstance } from 'class-transformer'
import { IsNotEmpty, IsString, validateOrReject } from 'class-validator'

import type { Context } from '#root/bot/context.js'
import type { FormStepFactory } from '#root/bot/shared/forms/form-step.js'
import type { FormValidateResult } from '#root/bot/shared/helpers/form.js'

import { formStep } from '#root/bot/shared/forms/form-step.js'
import { CancelPlugin } from '#root/bot/shared/forms/plugins/cancel.js'

class CompatibilityLabel {
  @IsNotEmpty()
  @IsString()
  public label: string
}

async function validateLabel(value: string): Promise<void> {
  const instance = plainToInstance(CompatibilityLabel, { label: value })
  await validateOrReject(instance)
}

type CompatibilityLabelStepOptions = {
  conversationId: string
}

function compatibilityLabelStep(options: CompatibilityLabelStepOptions): FormStepFactory<Context, string, string | null> {
  return formStep<Context>()({
    stepId: 'compatibilityLabel',
    plugins: [
      new CancelPlugin<Context>({
        callbackData: 'cancel_compatibility_label',
        conversationId: options.conversationId,
      }),
    ],

    async validate(input) {
      if (!input)
        throw new Error('Label не указан')

      await validateLabel(input)
    },

    async prompt({ ctx, plugins }) {
      // TODO: добавить i18n
      await ctx.reply('Введите имя партнера', { reply_markup: plugins.get('cancel').createKeyboard() })
    },

    async build({ ctx, form, validate, prompt, plugins }) {
      const cancelPlugin = plugins.get('cancel')
      cancelPlugin.setButton(ctx.t('cancel'))
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
          await ctx.reply(ctx.t('astro-data-birth-date-invalid'), { reply_markup: plugins.get('cancel').createKeyboard() })
        },
      })

      return label
    },
  })
}

export const createCompatibilityLabelStep = (options: CompatibilityLabelStepOptions) => compatibilityLabelStep(options)
