import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'
import { Expose, Transform, Type } from 'class-transformer'
import { IsDate, IsInt, IsNumber, IsOptional, IsString } from 'class-validator'

import type { Zodiac } from '../zodiac/zodiac.js'

dayjs.extend(utc)
dayjs.extend(timezone)

export class User {
  @Expose()
  @IsString()
  id: string

  @Expose()
  @Transform(({ value }) => value ?? undefined, { toClassOnly: true })
  @IsOptional()
  @IsString()
  email?: string

  @Expose()
  @Transform(({ value }) => value ?? undefined, { toClassOnly: true })
  @IsOptional()
  @IsString()
  provider?: string

  @Expose()
  @IsOptional()
  @IsString()
  socialId?: string

  @Expose()
  @IsOptional()
  @IsString()
  socialName?: string

  @Expose()
  @IsOptional()
  @IsString()
  firstName?: string

  @Expose()
  @IsOptional()
  @IsString()
  lastName?: string

  @Expose()
  @IsOptional()
  @IsString()
  birthDate?: string

  @Expose()
  @Transform(({ value, obj }) => {
    // Конвертируем из UTC в локальное время при чтении
    return User.convertBirthTimeFromUTC(obj.birthDate, value, obj.timezone)
  }, { toClassOnly: true })
  @Transform(({ value, obj }) => {
    // Конвертируем в UTC при записи
    return User.convertBirthTimeToUTC(obj.birthDate, value, obj.timezone)
  }, { toPlainOnly: true })
  @IsOptional()
  @IsString()
  birthTime?: string

  @Expose()
  @IsOptional()
  @IsString()
  birthDateTime?: string

  @Expose()
  @IsOptional()
  @IsString()
  timezone?: string

  @Expose()
  @IsOptional()
  photo?: any

  @Expose()
  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  latitude?: number

  @Expose()
  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  longitude?: number

  @Expose()
  @IsOptional()
  @IsInt()
  zodiacId?: number

  zodiac?: Zodiac

  @Expose()
  @Type(() => Date)
  @IsDate()
  createdAt!: Date

  @Expose()
  @Type(() => Date)
  @IsDate()
  updatedAt!: Date

  constructor(user: Partial<User>) {
    Object.assign(this, user)
  }

  static convertBirthTimeToUTC(
    birthDateISO?: string,
    birthTime?: string,
    timezone?: string,
  ): string | undefined {
    if (!birthTime || !birthDateISO || !timezone)
      return birthTime

    // Время уже должно быть нормализовано на этапе onboarding
    // Создаем дату-время в указанной таймзоне
    const localDateTime = dayjs.tz(
      `${birthDateISO} ${birthTime}`,
      'YYYY-MM-DD HH:mm',
      timezone,
    )

    if (!localDateTime.isValid())
      return birthTime

    // Конвертируем в UTC и возвращаем только время
    return localDateTime.utc().format('HH:mm')
  }

  static convertBirthTimeFromUTC(
    birthDateISO?: string,
    birthTimeUTC?: string,
    timezone?: string,
  ): string | undefined {
    if (!birthTimeUTC || !birthDateISO || !timezone)
      return birthTimeUTC

    // Создаем UTC дату-время
    const utcDateTime = dayjs.utc(`${birthDateISO} ${birthTimeUTC}`, 'YYYY-MM-DD HH:mm')

    if (!utcDateTime.isValid())
      return birthTimeUTC

    // Конвертируем в локальную таймзону и возвращаем только время
    return utcDateTime.tz(timezone).format('HH:mm')
  }
}
