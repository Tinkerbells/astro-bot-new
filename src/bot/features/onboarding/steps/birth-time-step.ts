import type { ValidationOptions } from 'class-validator'

import { Expose } from 'class-transformer'
import { IsNotEmpty, IsOptional, IsString, registerDecorator, validateOrReject } from 'class-validator'

import type { Context } from '#root/bot/context.js'

import type { OnboardingStep } from './step.types.js'

import { createBirthTimeKeyboard } from '../keyboards.js'

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
  birthTime?: string
  birthTimeSkipped?: boolean
}

export class BirthTimeStep implements OnboardingStep<BirthTimeData> {
  @Expose()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @IsValidBirthTime()
  birthTime?: string

  public init(input: string) {
    const birthTime = input.trim().replace(/[:\-]/g, ':')
    this.birthTime = birthTime || undefined
  }

  public skip() {
    this.birthTime = undefined
  }

  public get data() {
    return {
      birthTime: this.birthTime,
    }
  }

  public message(ctx: Context) {
    return ctx.reply(ctx.t('onboarding-birth-time'), {
      reply_markup: createBirthTimeKeyboard(ctx),
    })
  }

  public async validate(ctx: Context) {
    try {
      await validateOrReject(this)
    }
    catch (err) {
      ctx.logger.error(err)
      await ctx.reply(ctx.t('onboarding-birth-time-invalid'))
      throw err
    }
  }
}
