import type { ValidationOptions } from 'class-validator'

import { Expose, Transform } from 'class-transformer'
import { IsNotEmpty, IsNumber, IsOptional, IsString, registerDecorator } from 'class-validator'

import { Step } from '#root/application/onboarding-service/index.js'

import { findCityByText } from '../utils/city-utils.js'
import { isValidTimezone as validateTimezone } from '../utils/timezone-utils.js'

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

export class TimezoneStep extends Step<TimezoneData> {
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

  constructor(input: string) {
    // Check if input is a city name from our list
    const cityOption = findCityByText(input)

    let data: TimezoneData

    if (cityOption) {
      data = {
        city: cityOption.city,
        timezone: cityOption.timezone,
        latitude: cityOption.latitude,
        longitude: cityOption.longitude,
      }
    }
    else {
      // Treat as timezone string
      const timezone = input.trim()
      data = { timezone }
    }

    super(data)

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
}
