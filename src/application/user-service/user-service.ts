import type { Logger } from '#root/shared/logger.js'
import type { User } from '#root/domain/entities/user/user.js'
import type { UserRepositoryDTO } from '#root/data/repositories/user-repository/index.js'
import type { UserRepository } from '#root/data/repositories/user-repository/user-repository.js'

import { logger } from '#root/shared/logger.js'
import { userRepository } from '#root/data/repositories/user-repository/user-repository.js'

export type UserStore = {
  getUser: () => User | null
  setUser: (user: User) => void
  clearUser: () => void
}

class MemoryUserStore implements UserStore {
  private user: User | null = null

  public getUser(): User | null {
    return this.user
  }

  public setUser(user: User): void {
    this.user = user
  }

  public clearUser(): void {
    this.user = null
  }
}

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly store: UserStore,
    private readonly logger: Logger,
  ) { }

  public async loadUserBySocialId(dto: UserRepositoryDTO.GetUserBySocialIdDTO): Promise<User> {
    const existingUser = this.store.getUser()
    if (existingUser && existingUser.socialId === dto.socialId) {
      return existingUser
    }

    try {
      const user = await this.userRepository.getBySocialId(dto)
      this.store.setUser(user)
      return user
    }
    catch (error) {
      throw new Error(`Не удалось загрузить пользователя с socialId ${dto.socialId}: ${error}`)
    }
  }

  public async registerUser(dto: UserRepositoryDTO.RegisterUserDTO): Promise<User> {
    try {
      const user = await this.userRepository.register(dto)
      this.store.setUser(user)
      return user
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

  public getCurrentUser(): User | null {
    return this.store.getUser()
  }

  public clearCurrentUser(): void {
    this.store.clearUser()
  }
}

export function createUserService(): UserService {
  return new UserService(userRepository, new MemoryUserStore(), logger)
}
