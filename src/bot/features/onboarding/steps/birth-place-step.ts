import { Expose } from 'class-transformer'
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

import type { Context } from '#root/bot/context.js'
import type { FormValidateResult } from '#root/bot/shared/helpers/form-utils.js'

import { safe } from '#root/shared/safe/index.js'
import { City } from '#root/domain/entities/city/city.js'
import { cityService } from '#root/bot/services/city-service/index.js'

import { findCityByText } from '../utils/city-utils.js'
import { parseCoordinates } from '../utils/coordinates-utils.js'
import { getTimezoneByCoordinates, isValidTimezone } from '../utils/timezone-utils.js'

export type BirthPlaceData = {
  city?: string
  timezone: string
  latitude: number
  longitude: number
}

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
  static async handleTextInput(input: string): Promise<BirthPlaceData | null> {
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
    const [apiError, cities] = await safe(cityService.searchCities(trimmed))
    if (!apiError && cities && cities.length > 0) {
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
  static toFormBuilder() {
    return {
      collationKey: 'form-birth-place',
      validate: async (ctx: Context): Promise<FormValidateResult<BirthPlaceData>> => {
        // Обработка callback_query от Inline кнопок с городами
        if (ctx.callbackQuery?.data?.startsWith('onboarding:timezone:city:')) {
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
          const result = await BirthPlaceStep.handleTextInput(ctx.message.text)

          if (!result) {
            // Город не найден - предлагаем ввести координаты
            return { ok: false, error: 'city_not_found' }
          }

          return { ok: true, value: result }
        }

        return { ok: false, error: 'No valid input' }
      },
      otherwise: async (ctx: Context, error?: unknown) => {
        if (error === 'city_not_found') {
          await ctx.reply(ctx.t('onboarding-location-not-found-try-coordinates'))
        }
        else {
          await ctx.reply(ctx.t('onboarding-location-invalid'))
        }
      },
    }
  }

  /**
   * Создает FormBuilder для обработки координат (второй шаг после неудачного поиска города)
   */
  static toCoordinatesFormBuilder() {
    return {
      collationKey: 'form-birth-place-coordinates',
      validate: async (ctx: Context): Promise<FormValidateResult<BirthPlaceData>> => {
        if (!ctx.message?.text)
          return { ok: false, error: 'No text message' }

        const result = BirthPlaceStep.handleCoordinates(ctx.message.text)

        if (!result)
          return { ok: false, error: 'Invalid coordinates' }

        return { ok: true, value: result }
      },
      otherwise: async (ctx: Context) => {
        await ctx.reply(ctx.t('onboarding-coordinates-invalid'))
      },
    }
  }
}
