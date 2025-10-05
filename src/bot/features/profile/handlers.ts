import { Composer } from 'grammy'

import type { Context } from '#root/bot/context.js'

import { profileMenu } from './menu.js'

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
  let zodiacText = ctx.t('profile-field-missing')
  if (user.zodiac) {
    zodiacText = `${user.zodiac.icon} ${ctx.t(user.zodiac.getI18nKey())}`
  }

  // Форматируем информацию о пользователе
  const profileInfo = ctx.t('profile-info', {
    name: user.firstName || ctx.t('profile-field-missing'),
    birthDate: user.birthDate || ctx.t('profile-field-missing'),
    birthTime: user.birthTime || ctx.t('profile-field-missing'),
    timezone: user.timezone || ctx.t('profile-field-missing'),
    city: ctx.t('profile-field-missing'), // TODO: добавить city когда появится в User
    zodiac: zodiacText,
  })

  await ctx.reply(`${ctx.t('profile-title')}\n\n${profileInfo}`, {
    reply_markup: profileMenu,
  })
})

export { composer as profileFeature }
