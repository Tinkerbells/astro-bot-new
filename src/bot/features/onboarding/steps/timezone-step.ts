import type { ValidationOptions } from 'class-validator'

import { Expose, Transform } from 'class-transformer'
import { IsNotEmpty, IsNumber, IsOptional, IsString, registerDecorator, validateOrReject } from 'class-validator'

import type { Context } from '#root/bot/context.js'
import type { City } from '#root/domain/entities/index.js'

import { safe } from '#root/shared/safe/index.js'
import { cityService } from '#root/bot/services/city-service/index.js'

import type { OnboardingStep } from './step.types.js'

import { findCityByText } from '../utils/city-utils.js'
import { parseCoordinates } from '../utils/coordinates-utils.js'
import { isValidTimezone as validateTimezone } from '../utils/timezone-utils.js'
import { createCitiesInlineKeyboard, createLocationRequestKeyboard } from '../keyboards.js'

// Custom validator for timezone
function IsValidTimezone(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidTimezone',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return validateTimezone(value)
        },
        defaultMessage() {
          return 'Неверный часовой пояс. Используйте формат Area/City (например: Europe/Moscow)'
        },
      },
    })
  }
}

export type TimezoneData = {
  city?: string
  timezone: string
  latitude?: number
  longitude?: number
}

export class TimezoneStep implements OnboardingStep<TimezoneData> {
  @Expose()
  @IsOptional()
  @IsString()
  city?: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  @IsValidTimezone()
  timezone!: string

  @Expose()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  latitude?: number

  @Expose()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  longitude?: number

  public async init(input: string) {
    this.city = undefined
    this.latitude = undefined
    this.longitude = undefined

    // Сначала пытаемся найти в популярных городах
    const localCity = findCityByText(input)
    if (localCity) {
      this.city = localCity.name
      this.timezone = localCity.timezone || ''
      this.latitude = localCity.lat
      this.longitude = localCity.lon
      return
    }

    // Затем ищем через Geocoding API
    const [error, cities] = await safe(cityService.searchCities(input))
    if (!error && cities && cities.length > 0) {
      const foundCity = cities[0]
      this.city = foundCity.name
      this.timezone = foundCity.timezone || ''
      this.latitude = foundCity.lat
      this.longitude = foundCity.lon
      return
    }

    // Проверяем, не ввел ли пользователь координаты напрямую
    const coordinates = parseCoordinates(input)
    if (coordinates) {
      // Пытаемся получить информацию о месте по координатам через обратное геокодирование
      const [reverseError, city] = await safe(
        cityService.getCityByCoordinates(coordinates.lat, coordinates.lon),
      )
      if (!reverseError && city) {
        this.city = city.name
        this.timezone = city.timezone || ''
        this.latitude = coordinates.lat
        this.longitude = coordinates.lon
        return
      }
      // Если не удалось получить город, сохраняем только координаты
      this.latitude = coordinates.lat
      this.longitude = coordinates.lon
      // timezone будет нужно задать вручную или получить из координат
      this.timezone = input.trim()
      return
    }

    // Fallback: считаем что пользователь ввел timezone вручную
    this.timezone = input.trim()
  }

  public setCity(city: City) {
    this.city = city.name
    this.timezone = city.timezone || ''
    this.latitude = city.lat
    this.longitude = city.lon
  }

  // TODO: добавить лучший способ
  skip = null

  public get data() {
    return {
      city: this.city,
      timezone: this.timezone,
      latitude: this.latitude,
      longitude: this.longitude,
    }
  }

  public async message(ctx: Context) {
    await ctx.reply(ctx.t('onboarding-location'), {
      reply_markup: createCitiesInlineKeyboard(),
    })

    return ctx.reply(ctx.t('onboarding-location-share'), {
      reply_markup: createLocationRequestKeyboard(ctx),
    })
  }

  public async validate(ctx: Context) {
    try {
      await validateOrReject(this)
    }
    catch (err) {
      ctx.logger.error(err)
      await ctx.reply(ctx.t('onboarding-timezone-invalid'))
      throw err
    }
  }
}
