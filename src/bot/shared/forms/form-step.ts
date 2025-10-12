import type { Conversation } from '@grammyjs/conversations'

import { randomUUID } from 'node:crypto'

import type { Context } from '#root/bot/context.js'

import type { FormBuildOptions, FormStepPlugin } from './plugins/index.js'

import { PluginManager } from './plugins/index.js'

type PluginClass<TContext extends Context> = {
  init: (
    ctx: TContext,
    conversation: Conversation<TContext, TContext>,
    stepId: string,
  ) => Promise<FormStepPlugin<TContext, string, undefined>> | FormStepPlugin<TContext, string, undefined>
}

type PluginFactory<TContext extends Context> = (
  ctx: TContext,
  conversation: Conversation<TContext, TContext>,
  stepId: string,
) => Promise<FormStepPlugin<TContext, string, undefined>> | FormStepPlugin<TContext, string, undefined>

type PluginInput<TContext extends Context> =
  | PluginClass<TContext>
  | PluginFactory<TContext>
  | FormStepPlugin<TContext, string, undefined>

type ExtractPlugin<TDefinition> = Awaited<
  TDefinition extends { init: (...args: any[]) => infer TReturn } ? TReturn : TDefinition extends (...args: any[]) => infer TReturn ? TReturn : TDefinition extends FormStepPlugin<any, any, any> ? TDefinition : never
>

type NormalizePlugin<TContext extends Context, TDefinition> = ExtractPlugin<TDefinition> extends FormStepPlugin<infer _C, infer N extends string, infer Config>
  ? ExtractPlugin<TDefinition> & FormStepPlugin<TContext, N, Config>
  : FormStepPlugin<TContext, string, undefined>

type InferPlugins<TConstructors extends readonly unknown[], TContext extends Context> = {
  [P in TConstructors[number]as ExtractPlugin<P> extends { name: infer N extends string } ? N : never]: NormalizePlugin<TContext, P>
}

type FormStepHelpers<
  TContext extends Context,
  TInput,
  TConstructors extends readonly PluginInput<TContext>[],
> = {
  ctx: TContext
  conversation: Conversation<TContext, TContext>
  plugins: PluginManager<TContext, InferPlugins<TConstructors, TContext>>
  validate: (input: TInput) => Promise<void>
  prompt: () => Promise<any>
  form: {
    build: <TValue>(options: FormBuildOptions<TContext, TValue>) => Promise<TValue>
  }
}

// Конфигурация для formStep
type FormStepConfig<
  TContext extends Context,
  TInput,
  TOutput,
  TConstructors extends readonly PluginInput<TContext>[],
> = {
  stepId?: string
  plugins?: TConstructors
  build: (helpers: FormStepHelpers<TContext, TInput, TConstructors>) => Promise<TOutput>
  validate: (input: TInput) => Promise<void>
  prompt: (helpers: Omit<FormStepHelpers<TContext, TInput, TConstructors>, 'validate' | 'prompt'>) => Promise<any>
}

export type FormStepFactory<TContext extends Context, TInput, TOutput = TInput> = (options: {
  ctx: TContext
  conversation: Conversation<TContext, TContext>
}) => {
  build: () => Promise<TOutput>
  validate: (input: TInput) => Promise<void>
  prompt: () => Promise<any>
}

const createUniqueId = () => randomUUID()
/**
 * Функция-билдер для создания formStep в функциональном стиле
 * Использует currying для автоматического вывода типов плагинов
 */
export function formStep<TContext extends Context = Context>() {
  return <
    const TConstructors extends readonly PluginInput<TContext>[],
    TInput = any,
    TOutput = any,
  >(
    config: FormStepConfig<TContext, TInput, TOutput, TConstructors>,
  ): FormStepFactory<TContext, TInput, TOutput> => {
    // Базовый stepId при создании formStep (если не передан явно)
    const stepId = config.stepId ?? `formStep_${createUniqueId()}`

    return ({ ctx, conversation }) => {
      let pluginManager: PluginManager<TContext, InferPlugins<TConstructors, TContext>> | null = null
      let initPromise: Promise<void> | null = null

      const resetState = () => {
        pluginManager = null
        initPromise = null
      }

      const ensurePlugins = async () => {
        if (!initPromise) {
          initPromise = (async () => {
            pluginManager = new PluginManager<TContext, InferPlugins<TConstructors, TContext>>(
              ctx,
              conversation,
              stepId,
              {
                onCleanup: async () => {
                  resetState()
                },
              },
            )

            if (config.plugins) {
              await pluginManager.use(config.plugins as readonly PluginInput<TContext>[])
            }
          })()
        }

        try {
          await initPromise
        }
        catch (error) {
          resetState()
          throw error
        }
      }

      const formHelper = {
        build: async <TValue>(options: FormBuildOptions<TContext, TValue>) => {
          await ensurePlugins()
          return pluginManager!.build(options)
        },
      }

      const promptWithInit = async () => {
        await ensurePlugins()
        return config.prompt({ ctx, conversation, plugins: pluginManager!, form: formHelper })
      }

      const getHelpers = async (): Promise<FormStepHelpers<TContext, TInput, TConstructors>> => {
        await ensurePlugins()
        return {
          ctx,
          conversation,
          plugins: pluginManager!,
          validate: config.validate,
          prompt: promptWithInit,
          form: formHelper,
        }
      }

      return {
        build: async () => {
          const helpers = await getHelpers()
          try {
            return await config.build(helpers)
          }
          finally {
            await helpers.plugins.cleanup()
          }
        },
        validate: config.validate,
        prompt: promptWithInit,
      }
    }
  }
}

export type FormStepOptions<TContext extends Context> = {
  ctx: TContext
  conversation: Conversation<TContext, TContext>
}
