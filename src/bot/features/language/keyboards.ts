import ISO6391 from 'iso-639-1'
import { InlineKeyboard } from 'grammy'

import type { Context } from '#root/bot/context.js'

import { chunk } from '#root/bot/shared/helpers/keyboard.js'
import { i18n } from '#root/bot/services/i18n-service/index.js'

import { changeLanguageData } from './callback-data.js'

export async function createChangeLanguageKeyboard(ctx: Context) {
  const currentLocaleCode = await ctx.i18n.getLocale()

  const getLabel = (code: string) => {
    const isActive = code === currentLocaleCode

    return `${isActive ? '✅ ' : ''}${ISO6391.getNativeName(code)}`
  }

  return InlineKeyboard.from(
    chunk(
      i18n.locales.map(localeCode => ({
        text: getLabel(localeCode),
        callback_data: changeLanguageData.pack({
          code: localeCode,
        }),
      })),
      2,
    ),
  )
}
