import type { User } from '#root/domain/entities/user/user.js'

import { apiHttpClient } from '#root/shared/index.js'

import type * as UserNetworkSourcesDTO from './dto.js'

export const userNetworkSources = {
  register: (dto: UserNetworkSourcesDTO.RegisterUserDTO) => {
    return apiHttpClient.post<User>('/v1/auth/telegram-bot/register', dto)
  },

  getBySocialId: (dto: UserNetworkSourcesDTO.GetUserBySocialIdDTO) => {
    return apiHttpClient.get<User>(`/v1/users/social/${dto.socialId}/telegram`)
  },

  update: (dto: UserNetworkSourcesDTO.UpdateUserDTO) => {
    return apiHttpClient.patch<User>(`/v1/users/${dto.id}`, dto)
  },
}

export type UserNetworkSources = typeof userNetworkSources
