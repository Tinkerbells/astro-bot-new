import type { NextFunction } from 'grammy'

import type { Context } from '#root/bot/context.js'
import type { UserService } from '#root/application/user-service/index.js'

export function createUserMiddleware(userService: UserService) {
  return async (ctx: Context, next: NextFunction): Promise<void> => {
    const telegramUser = ctx.from

    if (!telegramUser) {
      ctx.logger.error('No user data in context - this should never happen')
      throw new Error('Данные пользователя недоступны в обновлении Telegram')
    }

    try {
      const user = await userService.getOrCreateUser({
        socialId: String(telegramUser.id),
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
      })
      // После этой строки ctx.user гарантированно существует
      ctx.user = user
      ctx.logger.info({ userId: user.id, socialId: user.socialId }, 'User loaded')
    }
    catch (error) {
      ctx.logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        telegramUserId: telegramUser.id,
      }, 'Failed to load or create user')

      // Выбрасываем ошибку вместо отправки сообщения
      throw new Error(`Не удалось загрузить или создать пользователя: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
    }

    await next()
  }
}
