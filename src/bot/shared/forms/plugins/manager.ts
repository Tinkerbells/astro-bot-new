import type { Conversation } from '@grammyjs/conversations'

import type { Context } from '#root/bot/context.js'

import type { FormBuildOptions } from './types.js'

import { FormStepPlugin } from './types.js'

// Вспомогательные типы
type PluginMap<TContext extends Context> = {
  [K in string]: FormStepPlugin<TContext, string, undefined>
}

type PluginClass<TContext extends Context> = {
  init: (
    ctx: TContext,
    conversation: Conversation<TContext, TContext>,
    stepId: string,
  ) => Promise<FormStepPlugin<TContext, string>> | FormStepPlugin<TContext, string>
}

type PluginFactory<TContext extends Context> = (
  ctx: TContext,
  conversation: Conversation<TContext, TContext>,
  stepId: string,
) => Promise<FormStepPlugin<TContext, string>> | FormStepPlugin<TContext, string>

type PluginDefinition<TContext extends Context> =
  | PluginClass<TContext>
  | PluginFactory<TContext>
  | FormStepPlugin<TContext, string>

type PluginManagerOptions = {
  onCleanup?: () => Promise<void> | void
}

export class PluginManager<
  TContext extends Context = Context,
  TPlugins extends PluginMap<TContext> = Record<string, never>,
> {
  private plugins = new Map<keyof TPlugins & string, TPlugins[keyof TPlugins]>()
  private readonly onCleanup?: () => Promise<void> | void

  constructor(
    private readonly ctx: TContext,
    private readonly conversation: Conversation<TContext, TContext>,
    private readonly stepId: string,
    options?: PluginManagerOptions,
  ) {
    this.onCleanup = options?.onCleanup
  }

  /**
   * Регистрирует массив плагинов через статический метод init
   */
  public async use(plugins: readonly PluginDefinition<TContext>[]): Promise<void> {
    for (const Plugin of plugins) {
      let plugin: FormStepPlugin<TContext, string> | null = null

      if (Plugin instanceof FormStepPlugin) {
        plugin = Plugin
        if (typeof plugin.setup === 'function') {
          await plugin.setup(this.ctx, this.conversation, this.stepId)
        }
      }
      else if (typeof (Plugin as PluginClass<TContext>).init === 'function') {
        plugin = await (Plugin as PluginClass<TContext>).init(this.ctx, this.conversation, this.stepId)
      }
      else if (typeof Plugin === 'function') {
        const candidate = await (Plugin as PluginFactory<TContext>)(
          this.ctx,
          this.conversation,
          this.stepId,
        )
        plugin = candidate
      }

      if (!plugin) {
        throw new Error('Invalid plugin definition provided to form step')
      }

      if (typeof plugin.setup === 'function' && !(Plugin instanceof FormStepPlugin)) {
        await plugin.setup(this.ctx, this.conversation, this.stepId)
      }

      const pluginName = plugin.name as keyof TPlugins & string
      if (this.plugins.has(pluginName)) {
        throw new Error(`Plugin "${plugin.name}" is already registered`)
      }

      this.plugins.set(pluginName, plugin as TPlugins[keyof TPlugins])
    }
  }

  /**
   * Получает плагин по имени с автокомплитом и проверкой типов
   */
  public get<K extends keyof TPlugins>(name: K): TPlugins[K] {
    const plugin = this.plugins.get(name as keyof TPlugins & string)
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
  public async cleanup(): Promise<void> {
    for (const plugin of this.plugins.values()) {
      if (typeof plugin.cleanup === 'function') {
        await plugin.cleanup()
      }
    }

    this.plugins.clear()

    if (this.onCleanup) {
      await this.onCleanup()
    }
  }

  /**
   * Выполняет conversation.form.build с учётом плагинов
   */
  public async build<TValue>(
    options: FormBuildOptions<TContext, TValue>,
  ): Promise<TValue> {
    const originalBuild = this.conversation.form.build.bind(this.conversation.form) as (
      buildOptions: FormBuildOptions<TContext, TValue>,
    ) => Promise<TValue>

    const plugins = Array.from(this.plugins.entries()) as Array<[
      keyof TPlugins & string,
      TPlugins[keyof TPlugins],
    ]>

    const pipeline = plugins.reduceRight(
      (next, [, plugin]) => {
        if (typeof plugin.wrapFormBuild !== 'function') {
          return next
        }

        return async (buildOptions: FormBuildOptions<TContext, TValue>) => {
          return plugin.wrapFormBuild!(buildOptions, next)
        }
      },
      originalBuild,
    )

    return pipeline(options)
  }
}
