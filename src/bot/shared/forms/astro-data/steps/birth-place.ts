import type { Logger } from 'pino'

import { Expose } from 'class-transformer'
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

import type { Context } from '#root/bot/context.js'
import type { FormValidateResultWithReason } from '#root/bot/shared/helpers/form.js'

import { City } from '#root/domain/entities/city/city.js'
import { safeAsync } from '#root/shared/safe-async/index.js'
import { cityService } from '#root/bot/services/city-service/index.js'
import { findCityByText, getTimezoneByCoordinates, isValidTimezone, parseCoordinates } from '#root/shared/utils/astro/index.js'

import type { BirthPlaceData } from '../types.js'

/**
 * Form step для валидации и обработки места рождения
 *
 * Поддерживает несколько способов ввода:
 * 1. **Выбор из списка популярных городов** (inline кнопки)
 * 2. **Текстовый ввод названия города** (локальный поиск + Geocoding API)
 * 3. **Геолокация** (отправка локации через Telegram)
 * 4. **Координаты** (формат: широта, долгота)
 *
 * Автоматически определяет timezone по координатам.
 *
 * @example
 * ```ts
 * // Показать inline клавиатуру с городами
 * await ctx.reply(ctx.t('choose-city'), {
 *   reply_markup: createCitiesInlineKeyboard()
 * })
 *
 * // Показать кнопку геолокации
 * await ctx.reply(ctx.t('or-share-location'), {
 *   reply_markup: createLocationRequestKeyboard(ctx)
 * })
 *
 * // Собрать данные с несколькими попытками (используется внутри collectBirthPlace)
 * const result = await BirthPlaceStep.toFormBuilder(
 *   'astro-data:timezone:city',
 *   ctx.t('astro-data-location-invalid')
 * ).validate(ctx)
 * ```
 */
export class BirthPlaceStep {
  @Expose()
  @IsOptional()
  @IsString()
  city?: string

  @Expose()
  @IsNotEmpty()
  @IsString()
  timezone: string

  @Expose()
  @IsNotEmpty()
  @IsNumber()
  latitude: number

  @Expose()
  @IsNotEmpty()
  @IsNumber()
  longitude: number

  /**
   * Обрабатывает геолокацию, полученную от пользователя
   * Возвращает только timezone и координаты (без запроса к API)
   */
  static handleLocation(
    latitude: number,
    longitude: number,
  ): BirthPlaceData | null {
    const timezone = getTimezoneByCoordinates(latitude, longitude)

    if (!isValidTimezone(timezone))
      return null

    return {
      timezone,
      latitude,
      longitude,
    }
  }

  /**
   * Обрабатывает текстовый ввод: название города или координаты
   */
  static async handleTextInput(input: string, logger?: Logger): Promise<BirthPlaceData | null> {
    const trimmed = input.trim()

    // 1. Проверяем локальную базу популярных городов
    const localCity = findCityByText(trimmed)
    if (localCity) {
      return {
        city: localCity.name,
        timezone: localCity.timezone || '',
        latitude: localCity.lat,
        longitude: localCity.lon,
      }
    }

    // 2. Ищем через Geocoding API
    const [apiError, cities] = await safeAsync(cityService.searchCities(trimmed))

    if (apiError) {
      logger?.error({ error: apiError, input: trimmed }, 'Failed to search city via Geocoding API')
      return null
    }

    if (cities && cities.length > 0) {
      const foundCity = cities[0]
      return {
        city: foundCity.name,
        timezone: foundCity.timezone || '',
        latitude: foundCity.lat,
        longitude: foundCity.lon,
      }
    }

    // 3. Если город не найден - возвращаем null для предложения ввести координаты
    return null
  }

  /**
   * Обрабатывает ввод координат вручную
   */
  static handleCoordinates(input: string): BirthPlaceData | null {
    const coordinates = parseCoordinates(input)
    if (!coordinates)
      return null

    return BirthPlaceStep.handleLocation(coordinates.lat, coordinates.lon)
  }

  /**
   * Создает FormBuilder для использования с conversation.form.build()
   */
  static toFormBuilder(
    callbackDataPrefix: string,
    invalidMessage: string,
  ) {
    return {
      collationKey: 'form-birth-place',
      validate: async (ctx: Context): Promise<FormValidateResultWithReason<BirthPlaceData, string>> => {
        // Обработка callback_query от Inline кнопок с городами
        if (ctx.callbackQuery?.data?.startsWith(`${callbackDataPrefix}:`)) {
          await ctx.answerCallbackQuery()

          const index = Number.parseInt(ctx.callbackQuery.data.split(':')[3], 10)
          const selectedCity = City.getPopularRussianCityByIndex(index)

          if (!selectedCity || !selectedCity.timezone)
            return { ok: false, error: 'Invalid city data' }

          return {
            ok: true,
            value: {
              city: selectedCity.name,
              timezone: selectedCity.timezone,
              latitude: selectedCity.lat,
              longitude: selectedCity.lon,
            },
          }
        }

        // Обработка геолокации
        if (ctx.message?.location) {
          const { latitude, longitude } = ctx.message.location
          const result = BirthPlaceStep.handleLocation(latitude, longitude)

          if (!result)
            return { ok: false, error: 'Invalid location' }

          return { ok: true, value: result }
        }

        // Обработка текстового ввода
        if (ctx.message?.text) {
          const result = await BirthPlaceStep.handleTextInput(ctx.message.text, ctx.logger)

          if (!result) {
            // Город не найден - предлагаем ввести координаты
            return { ok: false, error: 'city_not_found' }
          }

          return { ok: true, value: result }
        }

        return { ok: false, error: 'No valid input' }
      },
      otherwise: async (ctx: Context, error: string) => {
        if (error === 'city_not_found') {
          // Обрабатывается на уровне conversation (цикл попыток)

        }
        else {
          await ctx.reply(invalidMessage)
        }
      },
    }
  }

  /**
   * Создает FormBuilder для обработки координат (второй шаг после неудачного поиска города)
   */
  static toCoordinatesFormBuilder(errorMessage: string) {
    return {
      collationKey: 'form-birth-place-coordinates',
      validate: async (ctx: Context): Promise<FormValidateResultWithReason<BirthPlaceData, string>> => {
        if (!ctx.message?.text)
          return { ok: false, error: 'No text message' }

        const result = BirthPlaceStep.handleCoordinates(ctx.message.text)

        if (!result)
          return { ok: false, error: 'Invalid coordinates' }

        return { ok: true, value: result }
      },
      otherwise: async (ctx: Context, _error: string) => {
        await ctx.reply(errorMessage)
      },
    }
  }
}
