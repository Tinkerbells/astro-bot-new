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
  Min,
} from 'class-validator'

export class AscendantDTO {
  @IsString()
  id: string

  @IsInt()
  userId: number

  @IsObject()
  data: unknown

  @IsString()
  interpretation: string

  @Type(() => Date)
  @IsDate()
  createdAt: Date

  @Type(() => Date)
  @IsDate()
  updatedAt: Date
}

export class GuestAscendantResponseDTO {
  @IsObject()
  ascendant: unknown

  @IsString()
  interpretation: string
}

export class GenerateGuestDTO {
  @IsInt()
  userId: number

  @IsString()
  @IsISO8601()
  birthDate: string

  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number

  @IsNumber()
  @Min(-180)
  @Max(180)
  lon: number

  @IsOptional()
  @IsString()
  hsys?: string
}

export class GenerateUserAscendantDTO {
  @IsInt()
  userId: number

  @IsOptional()
  @IsString()
  hsys?: string
}

export class GenerateAscendantDTO {
  @IsInt()
  userId: number

  @IsString()
  @IsISO8601()
  birthDate: string

  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number

  @IsNumber()
  @Min(-180)
  @Max(180)
  lon: number

  @IsOptional()
  @IsString()
  hsys?: string
}

export class GetByIdDTO {
  @IsString()
  id: string
}

export class GetByUserIdDTO {
  @IsInt()
  userId: number
}

export class UpdateAscendantDTO {
  @IsString()
  id: string

  @IsOptional()
  @IsObject()
  data?: unknown

  @IsOptional()
  @IsString()
  interpretation?: string
}
