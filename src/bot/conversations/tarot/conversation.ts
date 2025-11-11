import type { Conversation } from '@grammyjs/conversations'

import type { Context } from '#root/bot/context.js'
import type { TarotRepositoryDTO } from '#root/data/repositories/tarot-repository/index.js'

import { safeAsync } from '#root/shared/index.js'
import { setConversationLocale } from '#root/bot/shared/helpers/conversation-locale.js'
import { formatTarotReadingForMenu } from '#root/bot/shared/menus/tarot-menu/utils/build-tarot-menu-range.js'

export async function tarotConversation(
  conversation: Conversation<Context, Context>,
  ctx: Context,
  spreadType: TarotRepositoryDTO.TarotSpreadTypesEnum,
) {
  await setConversationLocale(conversation, ctx)

  // TODO: i18n ключ
  const questionMessage = await ctx.reply('Введите свой вопрос')

  const { message } = await conversation.waitFor('message')

  await ctx.deleteMessage()
  await questionMessage.delete()

  if (message) {
    const [error, reading] = await safeAsync(conversation.external(async (ctx) => {
      const [error, data] = await safeAsync(ctx.tarotService.createReading(ctx, {
        question: message.text,
        spreadType,
      }))

      if (error || !data) {
        throw new Error('Error while creating tarot reading')
      }

      return data
    }))

    if (error) {
      ctx.logger.error({ error })
      await ctx.reply('errors-something-went-wrong')
      return
    }

    if (!reading) {
      ctx.logger.error({ error })
      await ctx.reply('errors-something-went-wrong')
      return
    }

    const readingMessage = formatTarotReadingForMenu(ctx, reading)
    await ctx.reply(readingMessage)
  }
}
