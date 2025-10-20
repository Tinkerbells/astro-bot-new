import type { NextFunction } from 'grammy'

import { plainToClass } from 'class-transformer'

import type { Context } from '#root/bot/context.js'
import type { UserService } from '#root/bot/services/user-service/index.js'

import { User, Zodiac } from '#root/domain/entities/index.js'

export function createUserSessionMiddleware(userService: UserService) {
  return async (ctx: Context, next: NextFunction): Promise<void> => {
    const telegramUser = ctx.from

    if (!telegramUser) {
      ctx.logger.error('Нет данных пользователя в контексте - этого не должно происходить')
      throw new Error('Данные пользователя недоступны в обновлении Telegram')
    }

    // Если пользователя нет в сессии, загружаем его
    if (!ctx.session.user) {
      try {
        const user = await userService.getOrCreateUser({
          socialId: String(telegramUser.id),
          socialName: telegramUser.username,
          firstName: telegramUser.first_name,
          lastName: telegramUser.last_name,
        })
        // Сохраняем пользователя в сессию для персистентности
        ctx.session.user = user
        ctx.logger.info({ userId: user.id, socialId: user.socialId }, 'Пользователь загружен и сохранен в сессию')
      }
      catch (error) {
        ctx.logger.error({
          error: error instanceof Error ? error.message : 'Неизвестная ошибка',
          telegramUserId: telegramUser.id,
        }, 'Не удалось загрузить или создать пользователя')

        throw new Error(`Не удалось загрузить или создать пользователя: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
      }
    }
    else {
      // Сериализуем
      const persistUser = plainToClass(User, ctx.session.user)
      if (persistUser.zodiacId) {
        persistUser.zodiac = Zodiac.getByIndex(persistUser.zodiacId)
      }
      ctx.session.user = persistUser
      ctx.logger.debug({ userId: ctx.session.user.id, socialId: ctx.session.user.socialId }, 'Пользователь загружен из сессии')
    }

    await next()
  }
}
