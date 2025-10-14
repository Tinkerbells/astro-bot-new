import type { Menu } from '@grammyjs/menu'
import type { Message } from 'grammy/types'
import type { Other } from '@grammyjs/hydrate'
import type { TranslationVariables } from '@grammyjs/i18n'
import type { Conversation, ConversationMenu, ConversationMenuRange } from '@grammyjs/conversations'

import type { Context } from '#root/bot/context.js'

/**
 * Состояние одного экрана меню
 */
export type MenuState = {
  textKey: string // i18n ключ для текста
  textParams?: TranslationVariables<string> // параметры для i18n
  menuId: string // ID меню
  data?: Record<string, any> // дополнительные данные
}

/**
 * Данные навигации для конкретного меню
 */
export type MenuNavigationData = {
  messageId: number // ID сообщения с меню
  stack: MenuState[] // стек состояний
}

type MenuDefinition = {
  getRootMenu?: () => Menu<Context>
  buildConversationRange?: (ctx: Context, range: ConversationMenuRange<Context>) => void | Promise<void>
}

const menuRegistry = new Map<string, MenuDefinition>()

export function registerMenuDefinition(menuId: string, definition: MenuDefinition) {
  const existing = menuRegistry.get(menuId) ?? {}
  menuRegistry.set(menuId, {
    ...existing,
    ...definition,
  })
}

export function getMenuDefinition(menuId: string): MenuDefinition | undefined {
  return menuRegistry.get(menuId)
}

type ReplyMarkup = NonNullable<Other<'sendMessage', 'chat_id' | 'text'>['reply_markup']>
type ReplyOptions = Omit<Other<'sendMessage', 'chat_id' | 'text'>, 'reply_markup'>

type ReplyWithMenuOptions = {
  menuKey: string
  textKey: string
  textParams?: TranslationVariables<string>
  replyMarkup: ReplyMarkup
  other?: ReplyOptions
}

type ReplyWithConversationMenuOptions = {
  conversationCtx: Context
  externalCtx: Context
  menuKey: string
  textKey: string
  textParams?: TranslationVariables<string>
  replyMarkup: ReplyMarkup
  other?: ReplyOptions
}

export class MenuManager {
  constructor(private readonly ctx: Context) { }

  /**
   * Инициализирует меню с начальным состоянием
   */
  public initMenu(key: string, messageId: number, initialState: MenuState): MenuNavigationData {
    const menuData: MenuNavigationData = {
      messageId,
      stack: [initialState],
    }

    const session = this.ctx.session

    if (!session) {
      this.ctx.logger.warn(
        { menuKey: key },
        'Session is unavailable, menu state will not be persisted',
      )
      return menuData
    }

    const prevMenus = session.menus ?? {}
    const nextMenus = {
      ...prevMenus,
      [key]: menuData,
    }

    session.menus = nextMenus
    return menuData
  }

  /**
   * Добавляет новое состояние в стек (переход вперёд)
   */
  public pushState(key: string, state: MenuState): MenuNavigationData | null {
    const menu = this.getMenuNavigation(key)
    if (!menu) {
      return null
    }

    menu.stack.push(state)
    this.updateMenu(key, menu)
    return menu
  }

  /**
   * Удаляет текущее состояние и возвращает предыдущее (переход назад)
   */
  public popState(key: string): MenuState | null {
    const menu = this.getMenuNavigation(key)
    if (!menu || menu.stack.length <= 1) {
      return null
    }

    menu.stack.pop()
    this.updateMenu(key, menu)
    return this.getCurrentState(key)
  }

  /**
   * Получает текущее состояние меню
   */
  public getCurrentState(key: string): MenuState | null {
    const menu = this.getMenuNavigation(key)
    if (!menu || menu.stack.length === 0) {
      return null
    }

    return menu.stack[menu.stack.length - 1]
  }

  /**
   * Обновляет текущее состояние (например, изменяет data)
   */
  public updateCurrentState(key: string, updates: Partial<MenuState>): MenuState | null {
    const menu = this.getMenuNavigation(key)
    if (!menu || menu.stack.length === 0) {
      return null
    }

    const currentIndex = menu.stack.length - 1
    menu.stack[currentIndex] = {
      ...menu.stack[currentIndex],
      ...updates,
    }

    this.updateMenu(key, menu)
    return menu.stack[currentIndex]
  }

  /**
   * Получает данные навигации меню
   */
  public getMenuNavigation(key: string): MenuNavigationData | null {
    const menus = this.ctx.session.menus
    const menuData = menus?.[key]

    if (!menuData) {
      return null
    }

    // Проверяем, что это новый формат с навигацией
    if ('stack' in menuData) {
      return menuData as MenuNavigationData
    }

    return null
  }

  /**
   * Генерирует текст для текущего состояния с учётом i18n
   */
  public renderCurrentText(key: string): string | null {
    const state = this.getCurrentState(key)
    if (!state) {
      return null
    }

    return this.ctx.t(state.textKey, state.textParams)
  }

  /**
   * Очищает все меню
   */
  public cleanup() {
    this.ctx.session.menus = {}
  }

  /**
   * Возвращает ранее зарегистрированное меню для отправки вне диалога
   */
  public getMenuMarkup(menuKey: string): Menu<Context> | null {
    const definition = getMenuDefinition(menuKey)
    return definition?.getRootMenu ? definition.getRootMenu() : null
  }

  /**
   * Создает меню внутри conversation с заранее зарегистрированной структурой
   */
  public createConversationMenu(
    conversation: Conversation<Context, Context>,
    menuKey: string,
  ): ConversationMenu<Context> | null {
    const definition = getMenuDefinition(menuKey)
    if (!definition?.buildConversationRange) {
      return null
    }

    const menu = conversation.menu(menuKey)
    menu.dynamic(async (ctx, range) => {
      await definition.buildConversationRange!(ctx, range)
    })

    return menu
  }

  /**
   * Отправляет сообщение с меню и регистрирует его в менеджере
   */
  public async replyWithMenu({
    menuKey,
    textKey,
    textParams,
    replyMarkup,
    other,
  }: ReplyWithMenuOptions): Promise<Message.TextMessage | null> {
    const text = this.ctx.t(textKey, textParams)
    const message = await this.ctx.safeReply(text, {
      ...other,
      reply_markup: replyMarkup,
    })

    if (!message) {
      return null
    }

    this.initMenu(menuKey, message.message_id, {
      textKey,
      textParams,
      menuId: menuKey,
    })

    return message
  }

  /**
   * Отправляет сообщение с меню в рамках conversation и регистрирует его
   * Использует conversationCtx для отправки и externalCtx для инициализации состояния
   *
   * @param conversationCtx - контекст conversation для отправки сообщения
   * @param externalCtx - внешний контекст с доступом к session для initMenu
   * @param menuKey - ID меню
   * @param textKey - i18n ключ для текста
   * @param textParams - параметры для i18n
   * @param replyMarkup - разметка меню
   * @param other - дополнительные параметры отправки
   */
  public async replyWithConversationMenu({
    conversationCtx,
    externalCtx,
    menuKey,
    textKey,
    textParams,
    replyMarkup,
    other,
  }: ReplyWithConversationMenuOptions): Promise<Message.TextMessage | null> {
    const text = conversationCtx.t(textKey, textParams)
    const message = await conversationCtx.safeReply(text, {
      ...other,
      reply_markup: replyMarkup,
    })

    if (!message) {
      return null
    }

    // Используем external context для инициализации, так как session недоступен в conversation
    externalCtx.menuManager.initMenu(menuKey, message.message_id, {
      textKey,
      textParams,
      menuId: menuKey,
    })

    return message
  }

  private updateMenu(key: string, menu: MenuNavigationData) {
    const prevMenus = this.ctx.session.menus ?? {}
    this.ctx.session.menus = {
      ...prevMenus,
      [key]: menu,
    }
  }
}

export function createMenuManager(ctx: Context) {
  return new MenuManager(ctx)
}
