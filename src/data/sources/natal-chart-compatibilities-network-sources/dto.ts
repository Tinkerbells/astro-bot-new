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

export enum PremiumCompatibilitySection {
  Intimacy = 'intimacy',
  Finances = 'finances',
  Infidelity = 'infidelity',
}

export type NatalChartCompatibilityInterpretation = {
  introduction: string
  profiles: string
  element_balance: string
  tense_aspects: string
  harmonious_aspects: string
  house_overlays: string
  intimacy: string
  finances: string
  infidelity: string
  composite_chart: string
  conclusions_and_recommendations: string
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

  @IsOptional()
  @IsString()
  houseSystem?: string
}

export class NatalChartCompatibilityDTO {
  @IsString()
  id: string

  @IsInt()
  ownerUserId: number

  @IsObject()
  data: unknown

  @IsObject()
  interpretation: NatalChartCompatibilityInterpretation

  @IsString()
  label: string

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
