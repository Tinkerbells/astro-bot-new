import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator'

import type { User } from '#root/domain/entities/user/user.js'

export class RegisterUserDTO {
  @IsString()
  socialId: string

  @IsOptional()
  @IsString()
  firstName?: string

  @IsOptional()
  @IsString()
  lastName?: string

  @IsOptional()
  @IsDateString()
  birthDate?: string

  @IsOptional()
  @IsString()
  birthTime?: string | null

  @IsOptional()
  @IsString()
  timezone?: string

  @IsOptional()
  @IsNumber()
  latitude?: number | null

  @IsOptional()
  @IsNumber()
  longitude?: number | null
}

export type UpdateUserDTO = Partial<RegisterUserDTO>

export type UpdateUserInputDTO = { id: Required<User['id']> }

export class GetUserBySocialIdDTO {
  @IsString()
  socialId: string
}
