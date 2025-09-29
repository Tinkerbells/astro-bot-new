import type { Logger } from '#root/shared/logger.js'
import type { User } from '#root/domain/entities/user/user.js'
import type { UserRepositoryDTO } from '#root/data/repositories/user-repository/index.js'
import type { UserRepository } from '#root/data/repositories/user-repository/user-repository.js'

import { logger } from '#root/shared/logger.js'
import { userRepository } from '#root/data/repositories/user-repository/user-repository.js'

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: Logger,
  ) { }

  public async loadUserBySocialId(dto: UserRepositoryDTO.GetUserBySocialIdDTO): Promise<User> {
    try {
      return await this.userRepository.getBySocialId(dto)
    }
    catch (error) {
      throw new Error(`Не удалось загрузить пользователя с socialId ${dto.socialId}: ${error}`)
    }
  }

  public async registerUser(dto: UserRepositoryDTO.RegisterUserDTO): Promise<User> {
    try {
      return await this.userRepository.register(dto)
    }
    catch (error) {
      throw new Error(`Не удалось зарегистрировать пользователя: ${error}`)
    }
  }

  public async getOrCreateUser(dto: UserRepositoryDTO.RegisterUserDTO): Promise<User> {
    try {
      return await this.loadUserBySocialId({ socialId: dto.socialId })
    }
    catch (error) {
      this.logger.error(error instanceof Error && error.message)
      if (!dto.firstName) {
        throw new Error(`Пользователь с socialId ${dto.socialId} не найден и нет данных для регистрации`)
      }
      return await this.registerUser(dto)
    }
  }
}

export function createUserService(): UserService {
  return new UserService(userRepository, logger)
}
