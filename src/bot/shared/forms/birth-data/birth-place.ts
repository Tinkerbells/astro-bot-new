import { InlineKeyboard, Keyboard } from 'grammy'
import { plainToInstance } from 'class-transformer'
import { IsNotEmpty, IsNumber, IsOptional, IsString, validateOrReject } from 'class-validator'

import type { Context } from '#root/bot/context.js'
import type { FormValidateResult } from '#root/bot/shared/helpers/form.js'

import { safeAsync } from '#root/shared/index.js'
import { City } from '#root/domain/entities/index.js'
import { getTimezoneByCoordinates, isValidTimezone } from '#root/shared/utils/astro/index.js'

import type { FormStepFactory } from '../form-step.js'

import { formStep } from '../form-step.js'
import { CancelPlugin } from '../plugins/cancel.js'
import { AttemptsPlugin } from '../plugins/attempts.js'

type BirthPlaceStepOptions = {
  conversationId: string
  onCancel?: (ctx: Context) => Promise<void> | void
}

/**
 * Создает клавиатуру для запроса геолокации
 */
export function createLocationRequestKeyboard(
  ctx: Context,
) {
  return new Keyboard()
    .requestLocation(ctx.t('astro-data-location-request'))
    .resized()
    .oneTime()
}

/**
 * Создает inline клавиатуру с популярными российскими городами
 */
export function createCitiesInlineKeyboard(
  callbackDataPrefix = 'astro-data:timezone:city',
  extraKeyboard?: InlineKeyboard,
) {
  const keyboard = new InlineKeyboard()

  City.popularRussianCities.forEach((city, index) => {
    keyboard.text(city.name, `${callbackDataPrefix}:${index}`)
    if ((index + 1) % 2 === 0)
      keyboard.row()
  })

  if (extraKeyboard) {
    keyboard.inline_keyboard.push(...extraKeyboard.inline_keyboard)
  }

  return keyboard
}

class BirthPlace {
  @IsOptional()
  @IsString()
  public city?: string

  @IsNotEmpty()
  @IsString()
  public timezone: string

  @IsNotEmpty()
  @IsNumber()
  public latitude: number

  @IsNotEmpty()
  @IsNumber()
  public longitude: number
}

async function validateBirthPlace(data: BirthPlace): Promise<void> {
  const instance = plainToInstance(BirthPlace, { ...data })
  await validateOrReject(instance)
}

function createBirthPlaceStep(options: BirthPlaceStepOptions): FormStepFactory<Context, BirthPlace, BirthPlace | null> {
  return formStep<Context>()({
    stepId: 'birthPlace',
    plugins: [
      new AttemptsPlugin({
        maxAttempts: 5,
        onLimitReached: async (ctx) => {
          // TODO: создать отдельный ключ в i18n для этого текста
          await ctx.reply('Мы не смогли найти ваше место рождения(')
          return { ok: true, value: null }
        },
      }),
      new CancelPlugin<Context>({
        callbackData: 'cancel_birth_place',
        conversationId: options.conversationId,
        onCancel: options.onCancel,
      }),
    ],

    async validate(input: BirthPlace | null) {
      if (!input)
        throw new Error('Место рождения не указано')

      await validateBirthPlace(input)
    },

    async prompt({ ctx, plugins }) {
      // TODO: создать отдельный ключ в i18n для этого текста
      await ctx.safeReply('Введите его название или используете кнопку геолокации', { reply_markup: createLocationRequestKeyboard(ctx) })
      await ctx.safeReply('Популярные города', {
        reply_markup: createCitiesInlineKeyboard(
          'astro-data:timezone:city',
          plugins.get('cancel').createKeyboard(),
        ),
      })
    },

    async build({ ctx, form, prompt, plugins }) {
      const cancelPlugin = plugins.get('cancel')
      cancelPlugin.setButton(ctx.t('cancel'))
      cancelPlugin.setOnCancel(options.onCancel)

      await prompt()

      const birthPlace = await form.build({
        collationKey: 'form-birth-place',
        validate: async (ctx): Promise<FormValidateResult<BirthPlace | null>> => {
          // Обрабатывает нажатие на клавиатуре популярных в России городов
          if (ctx.callbackQuery && ctx.callbackQuery?.data) {
            await ctx.answerCallbackQuery()
            const index = Number.parseInt(ctx.callbackQuery.data.split(':')[3], 10)
            const selectedCity = City.getPopularRussianCityByIndex(index)
            if (!selectedCity || !selectedCity.timezone)
              return { ok: false, error: new Error('Invalid city data') }
            return {
              ok: true,
              value: {
                timezone: selectedCity.timezone,
                city: selectedCity.name,
                latitude: selectedCity.lat,
                longitude: selectedCity.lon,
              },
            }
          }

          // Обработка геолокации
          if (ctx.message?.location) {
            const { latitude, longitude } = ctx.message.location
            const timezone = getTimezoneByCoordinates(latitude, longitude)

            if (!isValidTimezone(timezone))
              return { ok: false, error: new Error('Неправильная timezone') }

            return {
              ok: true,
              value: {
                timezone,
                latitude,
                longitude,
              },
            }
          }

          const text = (ctx.message ?? ctx.channelPost)?.text

          if (!text)
            return { ok: false, error: new Error('No text message') }

          const [error, cities] = await safeAsync(ctx.cityService.searchCities(text.trim()))

          if (error) {
            return {
              ok: false,
              error,
            }
          }

          if (cities && cities.length > 0) {
            const foundCity = cities[0]
            if (!foundCity.timezone || !isValidTimezone(foundCity.timezone))
              return { ok: false, error: new Error('Invalid city timezone') }
            return {
              ok: true,
              value: {
                city: foundCity.name,
                timezone: foundCity.timezone,
                latitude: foundCity.lat,
                longitude: foundCity.lon,
              },
            }
          }

          return { ok: false, error: new Error('City not found') }
        },
        otherwise: async (ctx: Context) => {
          await ctx.safeReply(ctx.t('astro-data-location-not-found'), {
            reply_markup: createCitiesInlineKeyboard(
              'astro-data:timezone:city',
              cancelPlugin.createKeyboard(),
            ),
          })
        },
      })
      return birthPlace
    },
  })
}

export const birthPlaceStep = (options: BirthPlaceStepOptions) => createBirthPlaceStep(options)
