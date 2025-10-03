import { plainToInstance } from 'class-transformer'

import type { UserNetworkSources } from '#root/data/sources/user-network-sources/index.js'

import { User } from '#root/domain/entities/user/user.js'
import { userNetworkSources } from '#root/data/sources/user-network-sources/index.js'

import type * as UserRepositoryDTO from './dto.js'

export class UserRepository {
  constructor(private readonly userNetworkSources: UserNetworkSources) { }

  public async register(dto: UserRepositoryDTO.RegisterUserDTO) {
    const data = await this.userNetworkSources.register(dto)
    return plainToInstance(User, data.data)
  }

  public async getBySocialId(dto: UserRepositoryDTO.GetUserBySocialIdDTO) {
    const data = await this.userNetworkSources.getBySocialId(dto)
    return plainToInstance(User, data.data)
  }

  public async update(dto: UserRepositoryDTO.UpdateUserDTO) {
    const data = await this.userNetworkSources.update(dto)
    return plainToInstance(User, data.data)
  }
}

export const userRepository = new UserRepository(userNetworkSources)
