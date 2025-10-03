import {
  IsDateString,
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
  birthDateTime?: string

  @IsOptional()
  @IsString()
  timezone?: string
}

export type UpdateUserDTO = Partial<RegisterUserDTO> & { id: Required<User['id']> }

export class GetUserBySocialIdDTO {
  @IsString()
  socialId: string
}
