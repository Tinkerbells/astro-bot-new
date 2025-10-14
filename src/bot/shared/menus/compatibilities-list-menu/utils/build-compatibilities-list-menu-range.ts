import type { MenuRange } from '@grammyjs/menu'

import type { Context } from '#root/bot/context.js'

import { safeAsync } from '#root/shared/index.js'

import { MenuId } from '../../menu-ids.js'

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
      const menu = ctx.menuManager.getMenuNavigation(MenuId.Profile)

      // Если в стеке есть дополнительные состояния (интерпретация), очищаем стек и обновляем текст
      if (menu && menu.stack.length > 1) {
        // Очищаем все состояния кроме начального
        while (menu.stack.length > 1) {
          ctx.menuManager.popState(MenuId.Profile)
        }

        // Обновляем текст на текст parent menu перед возвратом
        const newText = ctx.menuManager.renderCurrentText(MenuId.Profile)
        if (newText) {
          await ctx.api.editMessageText(ctx.chat!.id, menu.messageId, newText)
        }
      }

      // В любом случае возвращаемся в parent menu через grammY (обновляет клавиатуру)
      await ctx.menu.back()
    },
  )
}
