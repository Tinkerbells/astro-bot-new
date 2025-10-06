import type { Conversation } from '@grammyjs/conversations'

import type { Context } from '#root/bot/context.js'

/**
 * Результат валидации формы
 */
export type FormValidateResult<T> = { ok: false, error?: unknown } | { ok: true, value: T }

type FormBuilderLike<T> = {
  validate: (ctx: Context) => Promise<FormValidateResult<T>>
  otherwise?: (ctx: Context) => Promise<void>
  collationKey?: string
  maxMilliseconds?: number
}

type FormBuilderLikeWithReason<T, R> = {
  validate: (ctx: Context) => Promise<{ ok: false, error: R } | { ok: true, value: T }>
  otherwise?: (ctx: Context, reason?: R) => Promise<void>
  collationKey?: string
  maxMilliseconds?: number
}

export type BuildOptionalFieldOptions = {
  /** Callback data для кнопки "Пропустить" */
  skipCallbackData: string
  /** Сообщение при пропуске поля */
  skipMessage: string
  /** Сообщение при успешной валидации (опционально) */
  successMessage?: string
  /** Максимальное количество попыток ввода (по умолчанию бесконечно) */
  maxRetries?: number
}

/**
 * Универсальный помощник для создания optional полей в conversation forms.
 * Поддерживает обработку callback_query для пропуска поля и автоматический retry при ошибке валидации.
 *
 * @example
 * ```ts
 * const birthTime = await buildOptionalField<string>(
 *   conversation,
 *   ctx,
 *   BirthTimeStep.toFormBuilder(),
 *   {
 *     skipCallbackData: 'skip_birth_time',
 *     skipMessage: ctx.t('onboarding-birth-time-skipped'),
 *     successMessage: ctx.t('onboarding-birth-time-received'),
 *   }
 * )
 * ```
 */
export async function buildOptionalField<T>(
  conversation: Conversation<Context, Context>,
  ctx: Context,
  formBuilder: FormBuilderLike<T>,
  options: BuildOptionalFieldOptions,
): Promise<T | null> {
  let attempts = 0
  const maxRetries = options.maxRetries ?? Number.POSITIVE_INFINITY

  while (attempts < maxRetries) {
    attempts++

    // Ожидаем следующий апдейт
    const inputCtx = await conversation.wait({
      collationKey: formBuilder.collationKey,
      maxMilliseconds: formBuilder.maxMilliseconds,
    })

    // Проверка на skip через callback_query
    if (inputCtx.callbackQuery?.data === options.skipCallbackData) {
      await inputCtx.answerCallbackQuery()
      await inputCtx.reply(options.skipMessage, {
        reply_markup: { remove_keyboard: true },
      })
      return null
    }

    // Валидация через form builder
    const result = await formBuilder.validate(inputCtx)

    if (result.ok) {
      // Успешная валидация
      if (options.successMessage) {
        await inputCtx.reply(options.successMessage)
      }
      return result.value as T
    }
    else {
      // Ошибка валидации - вызываем otherwise callback
      if (formBuilder.otherwise) {
        await formBuilder.otherwise(inputCtx)
      }
      // Продолжаем цикл для повторной попытки
    }
  }

  // Если достигнут лимит попыток
  throw new Error(`Превышено максимальное количество попыток (${maxRetries}) для опционального поля`)
}

/**
 * Универсальный помощник для создания optional полей с поддержкой validation reason.
 * Расширенная версия buildOptionalField для FormBuilderWithReason.
 *
 * @example
 * ```ts
 * const location = await buildOptionalFieldWithReason<Location, string>(
 *   conversation,
 *   ctx,
 *   LocationStep.toFormBuilderWithReason(),
 *   {
 *     skipCallbackData: 'skip_location',
 *     skipMessage: ctx.t('location-skipped'),
 *     successMessage: ctx.t('location-received'),
 *   }
 * )
 * ```
 */
export async function buildOptionalFieldWithReason<T, R>(
  conversation: Conversation<Context, Context>,
  ctx: Context,
  formBuilder: FormBuilderLikeWithReason<T, R>,
  options: BuildOptionalFieldOptions,
): Promise<T | null> {
  let attempts = 0
  const maxRetries = options.maxRetries ?? Number.POSITIVE_INFINITY

  while (attempts < maxRetries) {
    attempts++

    // Ожидаем следующий апдейт
    const inputCtx = await conversation.wait({
      collationKey: formBuilder.collationKey,
      maxMilliseconds: formBuilder.maxMilliseconds,
    })

    // Проверка на skip через callback_query
    if (inputCtx.callbackQuery?.data === options.skipCallbackData) {
      await inputCtx.answerCallbackQuery()
      await inputCtx.reply(options.skipMessage, {
        reply_markup: { remove_keyboard: true },
      })
      return null
    }

    // Валидация через form builder
    const result = await formBuilder.validate(inputCtx)

    if (result.ok) {
      // Успешная валидация
      if (options.successMessage) {
        await inputCtx.reply(options.successMessage)
      }
      return result.value
    }
    else {
      // Ошибка валидации - вызываем otherwise callback с reason
      if (formBuilder.otherwise) {
        await formBuilder.otherwise(inputCtx, result.error)
      }
      // Продолжаем цикл для повторной попытки
    }
  }

  // Если достигнут лимит попыток
  throw new Error(`Превышено максимальное количество попыток (${maxRetries}) для опционального поля`)
}
