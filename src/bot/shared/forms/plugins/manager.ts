import type { Conversation } from '@grammyjs/conversations'

import type { Context } from '#root/bot/context.js'

import type { FormStepPlugin } from './types.js'

// Вспомогательные типы
type PluginMap<TContext extends Context> = {
  [K in string]: FormStepPlugin<TContext, string>
}

type PluginClass<TContext extends Context> = {
  init: (
    ctx: TContext,
    conversation: Conversation<TContext, TContext>,
    stepId: string,
  ) => Promise<FormStepPlugin<TContext, string>> | FormStepPlugin<TContext, string>
}

export class PluginManager<
  TContext extends Context = Context,
  TPlugins extends PluginMap<TContext> = Record<string, never>,
> {
  private plugins = new Map<string, FormStepPlugin<TContext, string>>()

  constructor(
    private readonly ctx: TContext,
    private readonly conversation: Conversation<TContext, TContext>,
    private readonly stepId: string,
  ) { }

  /**
   * Регистрирует массив плагинов через статический метод init
   */
  public async use(plugins: readonly PluginClass<TContext>[]): Promise<void> {
    for (const Plugin of plugins) {
      // Создаём и инициализируем плагин через статический метод init
      const plugin = await Plugin.init(this.ctx, this.conversation, this.stepId)

      if (this.plugins.has(plugin.name)) {
        throw new Error(`Plugin "${plugin.name}" is already registered`)
      }

      this.plugins.set(plugin.name, plugin)
    }
  }

  /**
   * Получает плагин по имени с автокомплитом и проверкой типов
   */
  public get<K extends keyof TPlugins>(name: K): TPlugins[K] {
    const plugin = this.plugins.get(name as string)
    if (!plugin) {
      throw new Error(`Plugin "${String(name)}" not found`)
    }

    return plugin as TPlugins[K]
  }

  /**
   * Проверяет наличие плагина (с автокомплитом имен)
   */
  public has(name: keyof TPlugins): boolean {
    return this.plugins.has(name as string)
  }

  /**
   * Очищает все плагины
   */
  public cleanup(): void {
    for (const plugin of this.plugins.values()) {
      plugin.cleanup?.()
    }
    this.plugins.clear()
  }
}
