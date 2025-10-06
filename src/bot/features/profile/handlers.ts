import { Composer } from 'grammy'

import type { Context } from '#root/bot/context.js'

import { createProfileMessage, profileMenu } from './menu.js'

export const composer = new Composer<Context>()

const feature = composer.chatType('private')

// Устанавливаем меню как middleware
feature.use(profileMenu)

// Обработчик команды /profile
feature.command('profile', async (ctx) => {
  const user = ctx.session.user

  if (!user) {
    await ctx.reply(ctx.t('errors-user-load-failed'))
    return
  }

  // Получаем знак зодиака если он есть
  let zodiacText: string | undefined
  if (user.zodiac) {
    zodiacText = `${user.zodiac.icon} ${ctx.t(user.zodiac.getI18nKey())}`
  }

  const message = createProfileMessage({ ctx, user, zodiacText })
  await message.send()
})

export { composer as profileFeature }
