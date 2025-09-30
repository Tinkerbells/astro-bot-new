import type { ValidationOptions } from 'class-validator'

import { Expose } from 'class-transformer'
import { IsNotEmpty, IsString, registerDecorator } from 'class-validator'

import { Step } from '#root/application/onboarding-service/index.js'

// Custom validator for birth time format and validity
function IsValidBirthTime(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidBirthTime',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string')
            return false

          // Check format first
          if (!/^\d{1,2}[:\-]\d{2}$/.test(value))
            return false

          // Parse and validate time
          const timeRegex = /^(\d{1,2})[:\-](\d{2})$/
          const match = value.match(timeRegex)

          if (!match)
            return false

          const hours = Number.parseInt(match[1], 10)
          const minutes = Number.parseInt(match[2], 10)

          return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59
        },
        defaultMessage() {
          return 'Время рождения должно быть в формате ЧЧ:ММ или ЧЧ-ММ и быть корректным временем'
        },
      },
    })
  }
}

export type BirthTimeData = {
  birthTime: string
}

export class BirthTimeStep extends Step<BirthTimeData> {
  @Expose()
  @IsNotEmpty()
  @IsString()
  @IsValidBirthTime()
  birthTime!: string

  constructor(input: string) {
    const birthTime = BirthTimeStep.formatToStandardTime(input.trim())
    super({ birthTime })
    this.birthTime = birthTime
  }

  private static formatToStandardTime(time: string): string {
    return time.replace(/[:\-]/g, ':')
  }
}
