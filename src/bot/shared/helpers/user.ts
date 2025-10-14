import type { Context } from '#root/bot/context.js'
import type { User } from '#root/domain/entities/user/user.js'

/**
 * Получает пользователя из сессии
 * Пользователь всегда должен быть в сессии благодаря user-session middleware
 */
export function getSessionUser(ctx: Context): User {
  return ctx.session.user
}

/**
 * Обновляет данные пользователя в сессии
 * Полезно когда пользователь изменил свои данные
 */
export function updateSessionUser(ctx: Context, user: User): void {
  ctx.session.user = user
}

export function canUseAstroFeature(user: User) {
  if (!user) {
    return false
  }

  return Boolean(
    user.birthDate
    && user.birthTime
    && user.timezone
    && user.latitude !== undefined
    && user.longitude !== undefined,
  )
}
