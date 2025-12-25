import { apiHttpClient } from '#root/shared/index.js'

import type * as NatalChartCompatibilitiesNetworkSourcesDTO from './dto.js'

export const natalChartCompatibilitiesNetworkSources = {
  createForUserWithGuest: (dto: NatalChartCompatibilitiesNetworkSourcesDTO.CreateCompatibilityUserGuestRequestDTO) => {
    const { userId, body } = dto
    return apiHttpClient.post<NatalChartCompatibilitiesNetworkSourcesDTO.NatalChartCompatibilityDTO>(
      '/v1/compatibilities/guest',
      body,
      {
        headers: { 'x-user-id': String(userId) },
      },
    )
  },

  createBySocialName: (dto: NatalChartCompatibilitiesNetworkSourcesDTO.CreateCompatibilityBySocialNameRequestDTO) => {
    const { userId, body } = dto
    return apiHttpClient.post<NatalChartCompatibilitiesNetworkSourcesDTO.NatalChartCompatibilityDTO>(
      '/v1/compatibilities/by-social-name',
      body,
      {
        headers: { 'x-user-id': String(userId) },
      },
    )
  },

  findAllByUserId: (userId: number, query?: NatalChartCompatibilitiesNetworkSourcesDTO.FindAllCompatibilitiesQueryDTO) => {
    return apiHttpClient.get<NatalChartCompatibilitiesNetworkSourcesDTO.InfinityPaginationResultDTO<NatalChartCompatibilitiesNetworkSourcesDTO.NatalChartCompatibilityDTO>>(
      '/v1/compatibilities/user',
      {
        params: query,
        headers: { 'x-user-id': String(userId) },
      },
    )
  },

  findById: (dto: NatalChartCompatibilitiesNetworkSourcesDTO.GetCompatibilityByIdDTO) => {
    const { id, userId } = dto
    return apiHttpClient.get<NatalChartCompatibilitiesNetworkSourcesDTO.NatalChartCompatibilityDTO>(
      `/v1/compatibilities/${id}`,
      userId
        ? { headers: { 'x-user-id': String(userId) } }
        : undefined,
    )
  },
}

export type NatalChartCompatibilitiesNetworkSources = typeof natalChartCompatibilitiesNetworkSources
