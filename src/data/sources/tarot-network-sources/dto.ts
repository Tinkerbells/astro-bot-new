import { Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator'

// Enums
export enum TarotSpreadTypesEnum {
  one_card = 0,
  three_card = 1,
  yes_no = 2,
  love = 3,
  celtic_cross = 4,
  career = 5,
  yearly = 6,
  decision = 7,
}

export type TarotSpreadType = TarotSpreadTypesEnum

// Card DTOs
export class TarotReadingCardDTO {
  @IsString()
  id: string

  @IsString()
  name: string

  @IsString()
  position: string

  @IsBoolean()
  isReversed: boolean
}

export class TarotReadingCardMeaningDTO {
  @IsString()
  position: string

  @IsString()
  cardName: string

  @IsString()
  meaning: string
}

// Request DTO
export class TarotReadingRequestDTO {
  @IsEnum(TarotSpreadTypesEnum)
  spreadType: TarotSpreadType

  @IsOptional()
  @IsString()
  @MaxLength(500)
  question?: string

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  context?: string
}

// Response DTO
export class TarotReadingResponseDTO {
  @IsOptional()
  @IsNumber()
  userId?: number | null

  @IsEnum(TarotSpreadTypesEnum)
  spreadType: TarotSpreadType

  @IsString()
  spreadId: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TarotReadingCardDTO)
  cards: TarotReadingCardDTO[]

  @IsString()
  interpretation: string

  @IsString()
  advice: string

  @IsOptional()
  @IsString()
  label?: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TarotReadingCardMeaningDTO)
  cardMeanings: TarotReadingCardMeaningDTO[]

  @IsUUID()
  readingId: string

  @IsISO8601()
  timestamp: string
}

// Spread Definition DTO
export class TarotSpreadDefinitionDTO {
  @IsString()
  id: string

  @IsEnum(TarotSpreadTypesEnum)
  spreadType: TarotSpreadType

  @IsString()
  @MaxLength(100)
  title: string

  @IsString()
  description: string

  @IsInt()
  cardCount: number

  @IsBoolean()
  questionRequired: boolean

  @IsArray()
  @IsString({ each: true })
  positions: string[]

  @IsOptional()
  @IsString()
  exampleQuestion?: string | null

  @IsOptional()
  @IsString()
  exampleContext?: string | null
}

// Update DTO
export class UpdateTarotReadingDTO {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  question?: string

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  context?: string

  @IsOptional()
  @IsString()
  @MaxLength(200)
  label?: string
}

// Method DTOs
export class CreateReadingDTO {
  @IsInt()
  userId: number

  @IsEnum(TarotSpreadTypesEnum)
  spreadType: TarotSpreadType

  @IsOptional()
  @IsString()
  @MaxLength(500)
  question?: string

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  context?: string
}

export class GetReadingByIdDTO {
  @IsString()
  @IsUUID()
  readingId: string
}

export class GetReadingsByUserIdDTO {
  @IsInt()
  userId: number

  @IsOptional()
  @IsInt()
  page?: number

  @IsOptional()
  @IsInt()
  limit?: number
}

export class GetReadingsBySocialIdDTO {
  @IsString()
  socialId: string

  @IsString()
  provider: string

  @IsOptional()
  @IsInt()
  page?: number

  @IsOptional()
  @IsInt()
  limit?: number
}

export class UpdateReadingDTO {
  @IsString()
  @IsUUID()
  readingId: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  question?: string

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  context?: string

  @IsOptional()
  @IsString()
  @MaxLength(200)
  label?: string
}

// Pagination Response
export class InfinityPaginationResponseDTO<T> {
  data: T[]
  hasNextPage: boolean
}
