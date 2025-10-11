import type { Conversation } from '@grammyjs/conversations'

import * as v from 'valibot'
import { randomUUID } from 'node:crypto'

import type { Context } from '#root/bot/context.js'

import type { FormBuildOptions, FormStepPlugin } from './plugins/index.js'

import { AttemptsPlugin, PluginManager, SkipPlugin } from './plugins/index.js'

// Тип для класса плагина со статическим методом init
type PluginClass<TContext extends Context> = {
  init: (
    ctx: TContext,
    conversation: Conversation<TContext, TContext>,
    stepId: string,
  ) => Promise<FormStepPlugin<TContext, string, undefined>> | FormStepPlugin<TContext, string, undefined>
}

// Извлекаем instance type из класса плагина
type InferPluginFromClass<TClass> = TClass extends { init: (...args: any[]) => infer TReturn }
  ? TReturn extends Promise<infer TPlugin> ? TPlugin : TReturn : never

// Получаем карту плагинов из массива классов
type InferPlugins<TConstructors extends readonly unknown[]> = {
  [P in InferPluginFromClass<
    Extract<TConstructors[number], PluginClass<any>>
  > as P extends { name: infer N extends string } ? N : never]: P
}

type FormStepHelpers<
  TContext extends Context,
  TInput,
  TConstructors extends readonly unknown[],
> = {
  ctx: TContext
  conversation: Conversation<TContext, TContext>
  plugins: PluginManager<TContext, InferPlugins<TConstructors>>
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
  TConstructors extends readonly unknown[],
> = {
  stepId?: string
  plugins?: TConstructors
  build: (helpers: FormStepHelpers<TContext, TInput, TConstructors>) => Promise<TOutput>
  validate: (input: TInput) => Promise<void>
  prompt: (helpers: Omit<FormStepHelpers<TContext, TInput, TConstructors>, 'validate' | 'prompt'>) => Promise<any>
}

export type FormStepFactory<TContext extends Context, TInput, TOutput> = (options: {
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
    const TConstructors extends readonly unknown[],
    TInput = any,
    TOutput = any,
  >(
    config: FormStepConfig<TContext, TInput, TOutput, TConstructors>,
  ): FormStepFactory<TContext, TInput, TOutput> => {
    // Базовый stepId при создании formStep (если не передан явно)
    const stepId = config.stepId ?? `formStep_${createUniqueId()}`

    return ({ ctx, conversation }) => {
      let pluginManager: PluginManager<TContext, InferPlugins<TConstructors>> | null = null
      let initPromise: Promise<void> | null = null

      const resetState = () => {
        pluginManager = null
        initPromise = null
      }

      const ensurePlugins = async () => {
        if (!initPromise) {
          initPromise = (async () => {
            pluginManager = new PluginManager<TContext, InferPlugins<TConstructors>>(
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
              const pluginClasses = config.plugins as readonly PluginClass<TContext>[]
              await pluginManager.use(pluginClasses)
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

const nameSchema = v.pipe(
  v.string('Имя должно быть строкой'),
  v.regex(/^Даня$/, 'Имя должно быть "Даня"'),
)

export const exampleFormStep = formStep<Context>()({
  plugins: [SkipPlugin, AttemptsPlugin],

  async validate(input) {
    if (input === null)
      throw new Error('Имя не указано')

    const result = v.safeParse(nameSchema, input)
    if (!result.success)
      throw new Error(result.issues.map(i => i.message).join(', '))
  },

  async prompt({ ctx, plugins }) {
    const skip = plugins.get('skip')
    await ctx.reply('Type you name or skip', {
      reply_markup: skip.createKeyboard(),
    })
  },

  async build({ plugins, validate, prompt, form }) {
    await prompt()
    const skip = plugins.get('skip')
    skip.setSkipResult(() => ({ ok: true, value: null }))

    const attempts = plugins.get('attempts')
    attempts.setMaxAttempts(3)
    attempts.setOnLimitReached(async (ctx: Context) => {
      await ctx.reply('You are out of limit')
      return { ok: true, value: null }
    })

    const name = await form.build({
      validate: async (ctx) => {
        const text = ctx.message?.text
        if (!text)
          return { ok: false, error: 'No text message' }

        try {
          await validate(text)
          return { ok: true, value: text }
        }
        catch (err) {
          return { ok: false, error: err }
        }
      },
      otherwise: async (ctx: Context) => {
        await ctx.reply('You are typing wrong name')
      },
    })

    await plugins.cleanup()

    return name
  },
})

export const exampleFormStep2 = formStep<Context>()({
  stepId: 'exampleFormStep2', // Явно указываем другой stepId
  plugins: [SkipPlugin, AttemptsPlugin],

  async validate(input) {
    if (input === null)
      throw new Error('Имя не указано')

    const result = v.safeParse(nameSchema, input)
    if (!result.success)
      throw new Error(result.issues.map(i => i.message).join(', '))
  },

  async prompt({ ctx, plugins }) {
    const skip = plugins.get('skip')
    skip.setButton('Skip step 2')
    await ctx.reply('Type you name or skip (step 2)', {
      reply_markup: skip.createKeyboard(),
    })
  },

  async build({ plugins, validate, prompt, form }) {
    await prompt()
    const skip = plugins.get('skip')
    skip.setSkipResult(() => ({ ok: true, value: null }))

    const attempts = plugins.get('attempts')
    attempts.setMaxAttempts(3)
    attempts.setOnLimitReached(async (ctx: Context) => {
      await ctx.reply('You are out of limit')
      return { ok: true, value: null }
    })

    const name = await form.build({
      validate: async (ctx) => {
        const text = ctx.message?.text
        if (!text)
          return { ok: false, error: 'No text message' }

        try {
          await validate(text)
          return { ok: true, value: text }
        }
        catch (err) {
          return { ok: false, error: err }
        }
      },
      otherwise: async (ctx: Context) => {
        await ctx.reply('You are typing wrong name')
      },
    })

    await plugins.cleanup()

    return name
  },
})
