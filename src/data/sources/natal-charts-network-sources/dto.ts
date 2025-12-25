import { Type } from 'class-transformer'
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator'

export type AstroSeekNatalParams = {
  natal_input: number
  send_calculation: number
  narozeni_den: number
  narozeni_mesic: number
  narozeni_rok: number
  narozeni_hodina: number
  narozeni_minuta: number
  narozeni_city?: string
  narozeni_mesto_hidden?: string
  narozeni_stat_hidden?: string
  narozeni_podstat_kratky_hidden?: string
  narozeni_sirka_stupne: number
  narozeni_sirka_minuty: number
  narozeni_sirka_smer: number
  narozeni_delka_stupne: number
  narozeni_delka_minuty: number
  narozeni_delka_smer: number
  narozeni_timezone_form: string
  narozeni_timezone_dst_form: string
  house_system: string
  hid_fortune: number
  hid_fortune_check: string
  hid_chiron: number
  hid_chiron_check: string
  hid_lilith: number
  hid_lilith_check: string
  hid_uzel: number
  hid_uzel_check: string
  tolerance: number
  tolerance_paral: number
  narozeni_no_cas?: string
}

export type AstroSeekInterpretationSection = {
  title: string
  text: string
}

export type AstroSeekNatalResponse = {
  url: string
  planets?: unknown[]
  interpretations?: AstroSeekInterpretationSection[]
}

export class NatalChartDTO {
  @IsString()
  id: string

  @IsOptional()
  @IsInt()
  userId: number | null

  @IsObject()
  requestParams: AstroSeekNatalParams

  @IsObject()
  rawPayload: AstroSeekNatalResponse

  @IsString()
  summary: string

  @IsOptional()
  @IsObject()
  data?: unknown

  @IsOptional()
  @IsString()
  interpretation?: string | null

  @IsBoolean()
  birthTimeUnknown: boolean

  @IsOptional()
  @IsString()
  houseSystem?: string | null

  @Type(() => Date)
  @IsDate()
  createdAt: Date

  @Type(() => Date)
  @IsDate()
  updatedAt: Date
}

export type GuestNatalChartResponseDTO = NatalChartDTO

export class GenerateGuestDTO {
  @IsInt()
  userId: number

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/u)
  birthDate: string

  @IsOptional()
  @IsString()
  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/u)
  birthTime?: string | null

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number

  @IsOptional()
  @IsString()
  houseSystem?: string

  @IsOptional()
  @IsString()
  timezone?: string
}

export class GenerateUserNatalChartDTO {
  @IsInt()
  userId: number
}

export class RegenerateUserNatalChartDTO {
  @IsInt()
  userId: number
}

export class GetLatestForUserDTO {
  @IsInt()
  userId: number
}

export class GetLatestForSocialDTO {
  @IsString()
  socialId: string

  @IsString()
  provider: string
}

export class GetByIdDTO {
  @IsString()
  id: string
}
