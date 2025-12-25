import { Type } from 'class-transformer'
import {
  IsDate,
  IsInt,
  IsISO8601,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator'

export type AstroSeekCompatibilityParams = {
  send_calculation: number
  muz_narozeni_den: number
  muz_narozeni_mesic: number
  muz_narozeni_rok: number
  muz_narozeni_hodina: number
  muz_narozeni_minuta: number
  muz_narozeni_city: string
  muz_narozeni_mesto_hidden: string
  muz_narozeni_stat_hidden: string
  muz_narozeni_podstat_kratky_hidden?: string
  muz_narozeni_sirka_stupne: number
  muz_narozeni_sirka_minuty: number
  muz_narozeni_sirka_smer: number
  muz_narozeni_delka_stupne: number
  muz_narozeni_delka_minuty: number
  muz_narozeni_delka_smer: number
  muz_narozeni_timezone_form: string
  muz_narozeni_timezone_dst_form: string
  zena_narozeni_den: number
  zena_narozeni_mesic: number
  zena_narozeni_rok: number
  zena_narozeni_hodina: number
  zena_narozeni_minuta: number
  zena_narozeni_city: string
  zena_narozeni_mesto_hidden: string
  zena_narozeni_stat_hidden: string
  zena_narozeni_podstat_kratky_hidden?: string
  zena_narozeni_sirka_stupne: number
  zena_narozeni_sirka_minuty: number
  zena_narozeni_sirka_smer: number
  zena_narozeni_delka_stupne: number
  zena_narozeni_delka_minuty: number
  zena_narozeni_delka_smer: number
  zena_narozeni_timezone_form: string
  zena_narozeni_timezone_dst_form: string
  house_system: string
  uhel_orbis: string
}

export type AstroSeekInterpretationSection = {
  title: string
  text: string
}

export type AstroSeekCompatibilityResponse = {
  url: string
  interpretations?: AstroSeekInterpretationSection[]
}

export class GuestParticipantDTO {
  @IsString()
  @MaxLength(64)
  label: string

  @IsString()
  @IsISO8601()
  birthDateTime: string

  @IsString()
  timezone: string

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number
}

export class CreateCompatibilityUserGuestDTO {
  @ValidateNested()
  @Type(() => GuestParticipantDTO)
  guest: GuestParticipantDTO

  @IsString()
  @MaxLength(120)
  label: string
}

export class CreateCompatibilityBySocialNameDTO {
  @IsString()
  partnerSocialName: string

  @IsString()
  @MaxLength(120)
  label: string
}

export class NatalChartCompatibilityDTO {
  @IsString()
  id: string

  @IsString()
  label: string

  @Type(() => Number)
  @IsNumber()
  userId: number

  @IsObject({ each: true })
  users: {
    userId?: string | number | null
    natalChartId?: string | null
    fullName: string
    birthDateTime: string
    latitude: number
    longitude: number
    timezone: string
  }[]

  @IsObject()
  requestParams: AstroSeekCompatibilityParams

  @IsObject()
  rawPayload: AstroSeekCompatibilityResponse

  @IsString()
  summary: string

  @Type(() => Date)
  @IsDate()
  createdAt: Date

  @Type(() => Date)
  @IsDate()
  updatedAt: Date
}

export class CreateCompatibilityUserGuestRequestDTO {
  @IsInt()
  userId: number

  @ValidateNested()
  @Type(() => CreateCompatibilityUserGuestDTO)
  body: CreateCompatibilityUserGuestDTO
}

export class CreateCompatibilityBySocialNameRequestDTO {
  @IsInt()
  userId: number

  @ValidateNested()
  @Type(() => CreateCompatibilityBySocialNameDTO)
  body: CreateCompatibilityBySocialNameDTO
}

export class FindAllCompatibilitiesQueryDTO {
  @IsOptional()
  @IsInt()
  page?: number

  @IsOptional()
  @IsInt()
  limit?: number
}

export class InfinityPaginationResultDTO<T> {
  data: T[]
  hasNextPage: boolean
}

export class GetCompatibilityByIdDTO {
  @IsString()
  id: string

  @IsOptional()
  @IsInt()
  userId?: number
}
