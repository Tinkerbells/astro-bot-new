import type { MenuRange } from '@grammyjs/menu'

import type { Context } from '#root/bot/context.js'

import { safeAsync } from '#root/shared/index.js'

import { MenuId } from '../../menu-ids.js'

export async function buildCompatibilitiesListMenuRange(
  range: MenuRange<Context>,
  ctx: Context,
) {
  const compatibilities = await ctx.compatibilitiesService.getUserCompatibilities(ctx)

  if (!compatibilities) {
    range.text(ctx.t('compatibilities-menu-empty'))
  }

  else {
    for (const compatibility of compatibilities) {
      const date = new Date(compatibility.createdAt).toLocaleDateString(ctx.t('locale-code') || 'ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })

      range
        .submenu(
          `📊 ${compatibility.label} (${date})`,
          MenuId.Compatibility,
          async (ctx) => {
            const [error, result] = await safeAsync(
              ctx.compatibilitiesService.getCompatibilityById(ctx, compatibility.id),
            )
            if (error) {
              ctx.reply('errors-something-went-wrong')
              ctx.logger.error({ err: error })
            }
            if (result) {
              await ctx.editMessageText(result, { parse_mode: 'HTML' })
            }
          },
        )
        .row()
    }
  }

  range.back(
    ctx => ctx.t('compatibilities-menu-back'),
    async (ctx) => {
      await ctx.editMessageText(ctx.t('profile-menu-compatibility'))
      ctx.menu.back()
    },
  )
}
