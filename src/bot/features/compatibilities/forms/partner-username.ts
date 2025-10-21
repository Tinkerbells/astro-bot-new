import { plainToInstance } from 'class-transformer'
import { IsNotEmpty, IsString, Matches, validateOrReject } from 'class-validator'

import type { Context } from '#root/bot/context.js'
import type { FormStepFactory } from '#root/bot/shared/forms/form-step.js'
import type { FormValidateResult } from '#root/bot/shared/helpers/form.js'

import { formStep } from '#root/bot/shared/forms/form-step.js'
import { CancelPlugin } from '#root/bot/shared/forms/plugins/cancel.js'

class PartnerUsername {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\w{5,32}$/, { message: 'Username должен содержать от 5 до 32 символов (буквы, цифры, подчеркивание)' })
  public username: string
}

async function validateUsername(value: string): Promise<void> {
  // Удаляем @ если пользователь ввел username с @
  const cleanUsername = value.startsWith('@') ? value.slice(1) : value
  const instance = plainToInstance(PartnerUsername, { username: cleanUsername })
  await validateOrReject(instance)
}

type PartnerUsernameStepOptions = {
  conversationId: string
}

function partnerUsernameStep(options: PartnerUsernameStepOptions): FormStepFactory<Context, string, string | null> {
  return formStep<Context>()({
    stepId: 'partnerUsername',
    plugins: [
      new CancelPlugin<Context>({
        callbackData: 'cancel_partner_username',
        conversationId: options.conversationId,
      }),
    ],

    async validate(input) {
      if (!input)
        throw new Error('Username не указан')

      await validateUsername(input)
    },

    async prompt({ ctx, plugins }) {
      await ctx.reply(ctx.t('compatibilities-partner-username-prompt'), { reply_markup: plugins.get('cancel').createKeyboard() })
    },

    async build({ ctx, form, validate, prompt, plugins }) {
      const cancelPlugin = plugins.get('cancel')
      cancelPlugin.setButton(ctx.t('cancel'))
      await prompt()

      const username = await form.build<string | null>({
        collationKey: 'form-partner-username',
        validate: async (ctx): Promise<FormValidateResult<string | null>> => {
          const text = (ctx.message ?? ctx.channelPost)?.text
          if (!text)
            return { ok: false, error: new Error('No text message') }

          try {
            await validate(text)
            // Удаляем @ если пользователь ввел username с @
            const cleanUsername = text.startsWith('@') ? text.slice(1) : text
            return { ok: true, value: cleanUsername }
          }
          catch (error) {
            return { ok: false, error }
          }
        },
        otherwise: async (ctx: Context) => {
          await ctx.reply(ctx.t('compatibilities-partner-username-invalid'), { reply_markup: plugins.get('cancel').createKeyboard() })
        },
      })

      return username
    },
  })
}

export const createPartnerUsernameStep = (options: PartnerUsernameStepOptions) => partnerUsernameStep(options)
