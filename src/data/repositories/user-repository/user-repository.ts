import { plainToInstance } from 'class-transformer'

import type { UserNetworkSources } from '#root/data/sources/user-network-sources/index.js'

import { User } from '#root/domain/entities/user/user.js'
import { Zodiac } from '#root/domain/entities/zodiac/zodiac.js'
import { userNetworkSources } from '#root/data/sources/user-network-sources/index.js'

import type * as UserRepositoryDTO from './dto.js'

export class UserRepository {
  constructor(private readonly userNetworkSources: UserNetworkSources) { }

  private attachZodiac(user: User): User {
    if (user.zodiacId) {
      user.zodiac = Zodiac.getByIndex(user.zodiacId)
    }

    return user
  }

  public async register(dto: UserRepositoryDTO.RegisterUserDTO): Promise<User> {
    const data = await this.userNetworkSources.register(dto)
    const user = plainToInstance(User, data.data)
    return this.attachZodiac(user)
  }

  public async getBySocialId(dto: UserRepositoryDTO.GetUserBySocialIdDTO): Promise<User> {
    const data = await this.userNetworkSources.getBySocialId(dto)
    const user = plainToInstance(User, data.data)
    return this.attachZodiac(user)
  }

  public async update(params: UserRepositoryDTO.UpdateUserInputDTO, dto: UserRepositoryDTO.UpdateUserDTO): Promise<User> {
    const data = await this.userNetworkSources.update(params, dto)
    const user = plainToInstance(User, data.data)
    return this.attachZodiac(user)
  }
}

export const userRepository = new UserRepository(userNetworkSources)
