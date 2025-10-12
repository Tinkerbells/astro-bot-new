import { apiHttpClient } from '#root/shared/index.js'

import type * as AscendantsNetworkSourcesDTO from './dto.js'

export const ascendantsNetworkSources = {
  generateGuest: (dto: AscendantsNetworkSourcesDTO.GenerateGuestDTO) => {
    const { userId, birthDate, lat, lon, hsys } = dto
    const params = new URLSearchParams({
      userId: String(userId),
      birthDate,
      lat: String(lat),
      lon: String(lon),
    })
    if (hsys) {
      params.append('hsys', hsys)
    }
    return apiHttpClient.get<AscendantsNetworkSourcesDTO.GuestAscendantResponseDTO>(
      `/v1/ascendants/guest?${params.toString()}`,
    )
  },

  generateForUser: (dto: AscendantsNetworkSourcesDTO.GenerateUserAscendantDTO) => {
    const { userId, hsys } = dto
    const params = hsys ? `?hsys=${hsys}` : ''
    return apiHttpClient.get<AscendantsNetworkSourcesDTO.AscendantDTO>(
      `/v1/ascendants/user/${userId}/create${params}`,
    )
  },

  create: (dto: AscendantsNetworkSourcesDTO.GenerateAscendantDTO) => {
    const { userId, birthDate, lat, lon, hsys } = dto
    const params = new URLSearchParams({
      userId: String(userId),
      birthDate,
      lat: String(lat),
      lon: String(lon),
    })
    if (hsys) {
      params.append('hsys', hsys)
    }
    return apiHttpClient.get<AscendantsNetworkSourcesDTO.AscendantDTO>(
      `/v1/ascendants/create?${params.toString()}`,
    )
  },

  findByUserId: (dto: AscendantsNetworkSourcesDTO.GetByUserIdDTO) => {
    return apiHttpClient.get<AscendantsNetworkSourcesDTO.AscendantDTO[]>(
      `/v1/ascendants/user/${dto.userId}`,
    )
  },

  findById: (dto: AscendantsNetworkSourcesDTO.GetByIdDTO) => {
    return apiHttpClient.get<AscendantsNetworkSourcesDTO.AscendantDTO>(`/v1/ascendants/${dto.id}`)
  },

  update: (dto: AscendantsNetworkSourcesDTO.UpdateAscendantDTO) => {
    const { id, ...body } = dto
    return apiHttpClient.patch<AscendantsNetworkSourcesDTO.AscendantDTO>(`/v1/ascendants/${id}`, body)
  },

  remove: (dto: AscendantsNetworkSourcesDTO.GetByIdDTO) => {
    return apiHttpClient.delete(`/v1/ascendants/${dto.id}`)
  },
}

export type AscendantsNetworkSources = typeof ascendantsNetworkSources
