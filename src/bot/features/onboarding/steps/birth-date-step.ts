import type { ValidationOptions } from 'class-validator'

import { Expose } from 'class-transformer'
import { IsNotEmpty, IsString, registerDecorator, validateOrReject } from 'class-validator'

import type { Context } from '#root/bot/context.js'

import type { OnboardingStep } from './step.types.js'

function IsValidBirthDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidBirthDate',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string')
            return false

          // Check format first
          if (!/^\d{2}[.\-]\d{2}[.\-]\d{4}$/.test(value))
            return false

          // Parse and validate date
          const cleanDate = value.replace(/[.\-]/g, '-')
          const [day, month, year] = cleanDate.split('-').map(Number)

          if (year < 1900 || year > new Date().getFullYear())
            return false
          if (month < 1 || month > 12)
            return false
          if (day < 1 || day > 31)
            return false

          // Check if date is valid
          const date = new Date(year, month - 1, day)
          return date.getFullYear() === year
            && date.getMonth() === month - 1
            && date.getDate() === day
        },
        defaultMessage() {
          return 'Дата рождения должна быть в формате ДД.ММ.ГГГГ или ДД-ММ-ГГГГ и быть корректной датой'
        },
      },
    })
  }
}

export type BirthDateData = {
  birthDate: string
}

export class BirthDateStep implements OnboardingStep<BirthDateData> {
  @Expose()
  @IsNotEmpty()
  @IsString()
  @IsValidBirthDate()
  birthDate!: string

  public init(input: string) {
    this.birthDate = input.trim()
  }

  public get data() {
    return { birthDate: this.birthDate }
  }

  public message(ctx: Context) {
    return ctx.reply(ctx.t('onboarding-birth-date'))
  }

  public async validate(ctx: Context) {
    try {
      await validateOrReject(this)
    }
    catch (err) {
      ctx.logger.error(err)
      await ctx.reply(ctx.t('onboarding-birth-date-invalid'))
      throw err
    }
  }
}
