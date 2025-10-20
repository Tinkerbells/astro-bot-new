import type { MenuRange } from '@grammyjs/menu'

import type { Context } from '#root/bot/context.js'

import { safeAsync } from '#root/shared/index.js'

export function buildCompatibilitiesListMenuRange(
  range: MenuRange<Context>,
  ctx: Context,
) {
  const compatibilities = ctx.session.compatibilitiesList || []

  for (const compatibility of compatibilities) {
    const date = new Date(compatibility.createdAt).toLocaleDateString(ctx.t('locale-code') || 'ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })

    range
      .text(
        `📊 ${compatibility.label} (${date})`,
        async (ctx) => {
          const [error] = await safeAsync(
            ctx.compatibilitiesService.replyWithCompatibilityById(ctx, compatibility.id),
          )
          if (error) {
            ctx.reply('errors-something-went-wrong')
            ctx.logger.error({ err: error })
          }
        },
      )
      .row()
  }

  range.back(
    ctx => ctx.t('compatibilities-menu-back'),
    async (ctx) => {
      await ctx.editMessageText(ctx.t('profile-menu-compatibility'))
      await ctx.menu.back()
    },
  )
}
