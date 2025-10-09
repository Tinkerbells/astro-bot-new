import { apiHttpClient } from '#root/shared/index.js'

import type * as NatalChartsNetworkSourcesDTO from './dto.js'

export const natalChartsNetworkSources = {
  generateGuest: (dto: NatalChartsNetworkSourcesDTO.GenerateGuestDTO) => {
    const { userId, birthDateTime, latitude, longitude, houseSystem } = dto
    const params = new URLSearchParams({
      userId: String(userId),
      birthDateTime,
      latitude: String(latitude),
      longitude: String(longitude),
    })
    if (houseSystem) {
      params.append('houseSystem', houseSystem)
    }
    return apiHttpClient.get<NatalChartsNetworkSourcesDTO.GuestNatalChartResponseDTO>(
      `/v1/natal-charts/guest?${params.toString()}`,
    )
  },

  generateForUser: (dto: NatalChartsNetworkSourcesDTO.GenerateUserNatalChartDTO) => {
    const { userId, houseSystem } = dto
    const params = houseSystem ? `?houseSystem=${houseSystem}` : ''
    return apiHttpClient.get<NatalChartsNetworkSourcesDTO.NatalChartDTO>(
      `/v1/natal-charts/user/${userId}${params}`,
    )
  },

  regenerateForUser: (dto: NatalChartsNetworkSourcesDTO.RegenerateUserNatalChartDTO) => {
    const { userId, houseSystem } = dto
    const params = houseSystem ? `?houseSystem=${houseSystem}` : ''
    return apiHttpClient.get<NatalChartsNetworkSourcesDTO.NatalChartDTO>(
      `/v1/natal-charts/user/${userId}/regenerate${params}`,
    )
  },

  getLatestForUser: (dto: NatalChartsNetworkSourcesDTO.GetLatestForUserDTO) => {
    return apiHttpClient.get<NatalChartsNetworkSourcesDTO.NatalChartDTO>(`/v1/natal-charts/user/${dto.userId}/latest`)
  },

  getLatestForSocial: (dto: NatalChartsNetworkSourcesDTO.GetLatestForSocialDTO) => {
    return apiHttpClient.get<NatalChartsNetworkSourcesDTO.NatalChartDTO>(
      `/v1/natal-charts/social/${dto.socialId}/${dto.provider}/latest`,
    )
  },

  getById: (dto: NatalChartsNetworkSourcesDTO.GetByIdDTO) => {
    return apiHttpClient.get<NatalChartsNetworkSourcesDTO.NatalChartDTO>(`/v1/natal-charts/${dto.id}`)
  },
}

export type NatalChartsNetworkSources = typeof natalChartsNetworkSources
