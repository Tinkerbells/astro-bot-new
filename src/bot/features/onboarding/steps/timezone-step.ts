import type { ValidationOptions } from 'class-validator'

import { Expose, Transform } from 'class-transformer'
import { IsNotEmpty, IsNumber, IsOptional, IsString, registerDecorator, validateOrReject } from 'class-validator'

import type { Context } from '#root/bot/context.js'

import type { CityData } from '../constants.js'
import type { OnboardingStep } from './step.types.js'

import { findCityByText } from '../utils/city-utils.js'
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

  public init(input: string) {
    this.city = undefined
    this.latitude = undefined
    this.longitude = undefined
    const cityOption = findCityByText(input)

    // Set properties after super()
    if (cityOption) {
      this.city = cityOption.city
      this.timezone = cityOption.timezone
      this.latitude = cityOption.latitude
      this.longitude = cityOption.longitude
    }
    else {
      this.timezone = input.trim()
    }
  }

  public setCity(cityData: CityData) {
    this.city = cityData.city
    this.timezone = cityData.timezone
    this.latitude = cityData.latitude
    this.longitude = cityData.longitude
  }

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
