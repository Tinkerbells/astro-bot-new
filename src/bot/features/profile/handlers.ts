import { Composer } from 'grammy'

import type { Context } from '#root/bot/context.js'

import { createProfileMessage } from '#root/bot/shared/menus/index.js'

export const composer = new Composer<Context>()

const feature = composer.chatType('private')

feature.command('profile', async (ctx) => {
  const message = createProfileMessage(ctx)
  await message.send()
})

export { composer as profileFeature }
