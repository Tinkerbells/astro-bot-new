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

export class NatalChartDTO {
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

export class GuestNatalChartResponseDTO {
  @IsObject()
  chart: unknown

  @IsString()
  interpretation: string
}

export class GenerateGuestDTO {
  @IsInt()
  userId: number

  @IsString()
  @IsISO8601()
  birthDateTime: string

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
}

export class GenerateUserNatalChartDTO {
  @IsInt()
  userId: number

  @IsOptional()
  @IsString()
  houseSystem?: string
}

export class RegenerateUserNatalChartDTO {
  @IsInt()
  userId: number

  @IsOptional()
  @IsString()
  houseSystem?: string
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
