import type { Checkpoint, Conversation } from '@grammyjs/conversations'

import type { Context } from '#root/bot/context.js'

import { safeAsync } from '#root/shared/index.js'

import { birthDateStep } from './birth-date.js'
import { birthTimeStep } from './birth-time.js'
import { birthPlaceStep } from './birth-place.js'

export async function birthDataForm(
  checkpoint: Checkpoint,
  ctx: Context,
  conversation: Conversation<Context, Context>,
) {
  const [birthDateError, birthDate] = await safeAsync(birthDateStep({ ctx, conversation }).build())
  if (birthDateError) {
    ctx.logger.error({ err: birthDateError })
    await ctx.reply(ctx.t('errors-something-went-wrong'))
    conversation.rewind(checkpoint)
  }

  const [birthTimeError, birthTime] = await safeAsync(birthTimeStep({ ctx, conversation }).build())
  if (birthTimeError) {
    ctx.logger.error({ err: birthTimeError })
    await ctx.reply(ctx.t('errors-something-went-wrong'))
    conversation.rewind(checkpoint)
  }

  const [birthPlaceError, birthPlace] = await safeAsync(birthPlaceStep({ ctx, conversation }).build())
  if (birthPlaceError) {
    ctx.logger.error({ err: birthPlaceError })
    await ctx.reply(ctx.t('errors-something-went-wrong'))
    conversation.rewind(checkpoint)
  }

  return {
    birthDate: birthDate!,
    birthTime,
    birthPlace: birthPlace!,
  }
}
