import { apiHttpClient } from '#root/shared/index.js'

import type * as NatalChartCompatibilitiesNetworkSourcesDTO from './dto.js'

export const natalChartCompatibilitiesNetworkSources = {
  createForUserWithGuest: (dto: NatalChartCompatibilitiesNetworkSourcesDTO.CreateCompatibilityUserGuestRequestDTO) => {
    const { userId, body } = dto
    return apiHttpClient.post<NatalChartCompatibilitiesNetworkSourcesDTO.NatalChartCompatibilityDTO>(
      `/v1/natal-chart-compatibilities/user/${userId}/guest`,
      body,
    )
  },

  findAllByUserId: (userId: number, query?: NatalChartCompatibilitiesNetworkSourcesDTO.FindAllCompatibilitiesQueryDTO) => {
    const params = new URLSearchParams()
    if (query?.page) {
      params.append('page', String(query.page))
    }
    if (query?.limit) {
      params.append('limit', String(query.limit))
    }
    const queryString = params.toString()
    const url = `/v1/natal-chart-compatibilities/user/${userId}${queryString ? `?${queryString}` : ''}`

    return apiHttpClient.get<NatalChartCompatibilitiesNetworkSourcesDTO.InfinityPaginationResultDTO<NatalChartCompatibilitiesNetworkSourcesDTO.NatalChartCompatibilityDTO>>(url)
  },

  findById: (id: string) => {
    return apiHttpClient.get<NatalChartCompatibilitiesNetworkSourcesDTO.NatalChartCompatibilityDTO>(
      `/v1/natal-chart-compatibilities/${id}`,
    )
  },
}

export type NatalChartCompatibilitiesNetworkSources = typeof natalChartCompatibilitiesNetworkSources
