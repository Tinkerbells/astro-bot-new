import type { Context } from '#root/bot/context.js'

import { Composer } from 'grammy'
import { chatAction } from '@grammyjs/auto-chat-action'
import { isAdmin } from '#root/bot/shared/filters/is-admin.js'
import { logHandle } from '#root/bot/shared/helpers/logging.js'
import { setCommandsHandler } from '#root/bot/handlers/commands/setcommands.js'

const composer = new Composer<Context>()

const feature = composer
  .chatType('private')
  .filter(isAdmin)

feature.command(
  'setcommands',
  logHandle('command-setcommands'),
  chatAction('typing'),
  setCommandsHandler,
)

export { composer as adminFeature }
