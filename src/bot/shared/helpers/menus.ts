import type { Context } from '#root/bot/context.js'

import type { MenuState } from '../services/menu-manager.js'

/**
 * Переходит на новый экран в меню, сохраняя историю навигации
 *
 * @param ctx - Контекст Grammy
 * @param menuKey - Ключ меню (например, 'profile-menu')
 * @param state - Новое состояние экрана
 *
 * @example
 * ```ts
 * await navigateToMenuScreen(ctx, 'profile-menu', {
 *   textKey: 'ascendants-interpretation-text',
 *   textParams: { interpretation: data.interpretation },
 *   menuId: 'ascendants-menu',
 *   data: { view: 'user-ascendant' }
 * })
 * ```
 */
export async function navigateToMenuScreen(
  ctx: Context,
  menuKey: string,
  state: MenuState,
): Promise<boolean> {
  const menu = ctx.menuManager.getMenuNavigation(menuKey)
  if (!menu) {
    return false
  }

  // Добавляем новое состояние в стек
  ctx.menuManager.pushState(menuKey, state)

  // Генерируем текст для нового экрана
  const newText = ctx.menuManager.renderCurrentText(menuKey)
  if (!newText) {
    return false
  }

  // Обновляем сообщение (без parse_mode чтобы избежать ошибок с специальными символами)
  await ctx.api.editMessageText(ctx.chat!.id, menu.messageId, newText)

  return true
}

/**
 * Возвращается на предыдущий экран в меню
 *
 * @param ctx - Контекст Grammy
 * @param menuKey - Ключ меню
 *
 * @example
 * ```ts
 * await navigateBack(ctx, 'profile-menu')
 * ```
 */
export async function navigateBack(
  ctx: Context,
  menuKey: string,
): Promise<boolean> {
  const menu = ctx.menuManager.getMenuNavigation(menuKey)
  if (!menu) {
    return false
  }

  // Возвращаемся на предыдущий экран
  const previousState = ctx.menuManager.popState(menuKey)
  if (!previousState) {
    return false
  }

  // Генерируем текст для предыдущего экрана
  const previousText = ctx.menuManager.renderCurrentText(menuKey)
  if (!previousText) {
    return false
  }

  // Обновляем сообщение (без parse_mode чтобы избежать ошибок с специальными символами)
  await ctx.api.editMessageText(ctx.chat!.id, menu.messageId, previousText)

  // Обновляем меню
  await ctx.menu.update({ immediate: true })

  return true
}

/**
 * Обновляет текущий экран меню (например, при изменении данных)
 *
 * @param ctx - Контекст Grammy
 * @param menuKey - Ключ меню
 * @param updates - Обновления для текущего состояния
 *
 * @example
 * ```ts
 * await updateCurrentMenuScreen(ctx, 'profile-menu', {
 *   textParams: { count: newCount }
 * })
 * ```
 */
export async function updateCurrentMenuScreen(
  ctx: Context,
  menuKey: string,
  updates: Partial<MenuState>,
): Promise<boolean> {
  const menu = ctx.menuManager.getMenuNavigation(menuKey)
  if (!menu) {
    return false
  }

  // Обновляем текущее состояние
  ctx.menuManager.updateCurrentState(menuKey, updates)

  // Генерируем новый текст
  const newText = ctx.menuManager.renderCurrentText(menuKey)
  if (!newText) {
    return false
  }

  // Обновляем сообщение (без parse_mode чтобы избежать ошибок с специальными символами)
  await ctx.api.editMessageText(ctx.chat!.id, menu.messageId, newText)

  return true
}

/**
 * Проверяет, можно ли вернуться назад (есть ли история)
 *
 * @param ctx - Контекст Grammy
 * @param menuKey - Ключ меню
 */
export function canNavigateBack(ctx: Context, menuKey: string): boolean {
  const menu = ctx.menuManager.getMenuNavigation(menuKey)
  if (!menu) {
    return false
  }

  return menu.stack.length > 1
}
