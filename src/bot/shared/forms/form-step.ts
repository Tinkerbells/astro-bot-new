import type { Conversation } from '@grammyjs/conversations'

import * as v from 'valibot'

import type { Context } from '#root/bot/context.js'

import type { FormStepPlugin } from './plugins/index.js'

import { AttemptsPlugin, PluginManager, SkipPlugin } from './plugins/index.js'

export type FormValidateResult<T> = { ok: false, error?: unknown } | { ok: true, value: T }

// Тип для класса плагина со статическим методом init
type PluginClass<TContext extends Context> = {
  init: (
    ctx: TContext,
    conversation: Conversation<TContext, TContext>,
    stepId: string,
  ) => Promise<FormStepPlugin<TContext, string>> | FormStepPlugin<TContext, string>
}

// Извлекаем instance type из класса плагина
type InferPluginFromClass<TClass> = TClass extends { init: (...args: any[]) => infer TReturn }
  ? TReturn extends Promise<infer TPlugin>
    ? TPlugin
    : TReturn
  : never

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

// Счетчик для генерации уникальных stepId
let stepIdCounter = 0

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
    // Генерируем уникальный stepId один раз при создании formStep
    const uniqueStepId = config.stepId ?? `formStep_${++stepIdCounter}_${Date.now()}`

    return ({ ctx, conversation }) => {
      // Создаем PluginManager с уникальным stepId
      const pluginManager = new PluginManager<TContext, InferPlugins<TConstructors>>(
        ctx,
        conversation,
        uniqueStepId,
      )

      // Регистрируем плагины асинхронно
      const init = async () => {
        if (config.plugins) {
          const pluginClasses = config.plugins as readonly PluginClass<TContext>[]
          await pluginManager.use(pluginClasses)
        }
      }

      // Создаем helpers
      const helpers: FormStepHelpers<TContext, TInput, TConstructors> = {
        ctx,
        conversation,
        plugins: pluginManager,
        validate: config.validate,
        prompt: async () => config.prompt({ ctx, conversation, plugins: pluginManager }),
      }

      return {
        build: async () => {
          await init()
          return config.build(helpers)
        },
        validate: config.validate,
        prompt: async () => {
          await init()
          return config.prompt({ ctx, conversation, plugins: pluginManager })
        },
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
  plugins: [AttemptsPlugin, SkipPlugin],

  async validate(input) {
    if (input === null)
      throw new Error('Имя не указано')

    const result = v.safeParse(nameSchema, input)
    if (!result.success)
      throw new Error(result.issues.map(i => i.message).join(', '))
  },

  async prompt({ ctx, plugins }) {
    await ctx.reply('Type you name or skip', {
      reply_markup: plugins.get('skip').createKeyboard(),
    })
  },

  async build({ conversation, plugins, validate, prompt }) {
    await prompt()
    const name = await conversation.form.build({
      validate: async (ctx) => {
        const currentAttempts = await plugins.get('attempts').increment()

        if (currentAttempts <= 3) {
          await plugins.get('skip').skip(ctx, () => {
            return { ok: true, value: null }
          })

          const text = ctx.message?.text
          if (!text)
            return { ok: false, error: 'No text message' }

          try {
            await validate(text)
            plugins.cleanup()
            return { ok: true, value: text }
          }
          catch (err) {
            return { ok: false, error: err }
          }
        }
        else {
          await ctx.reply('You are out of limit')
          plugins.cleanup()
          return { ok: true, value: null }
        }
      },
      otherwise: async (ctx: Context) => {
        await ctx.reply('You are typing wrong name')
      },
    })

    return name
  },
})
