import { apiHttpClient } from '#root/shared/index.js'

import type * as NatalChartsNetworkSourcesDTO from './dto.js'

import { astroSeekParamBuilder } from './astro-seek-param-builder.js'

export const natalChartsNetworkSources = {
  generateGuest: (dto: NatalChartsNetworkSourcesDTO.GenerateGuestDTO) => {
    const { userId, ...input } = dto
    const params = astroSeekParamBuilder.buildNatalParams(input)
    return apiHttpClient.get<NatalChartsNetworkSourcesDTO.GuestNatalChartResponseDTO>(
      '/v1/natal-charts/guest',
      {
        params: {
          userId,
          ...params,
        },
      },
    )
  },

  generateForUser: (dto: NatalChartsNetworkSourcesDTO.GenerateUserNatalChartDTO) => {
    const { userId } = dto
    return apiHttpClient.get<NatalChartsNetworkSourcesDTO.NatalChartDTO>(
      `/v1/natal-charts/user/${userId}`,
      {
        headers: { 'x-user-id': String(userId) },
      },
    )
  },

  regenerateForUser: (dto: NatalChartsNetworkSourcesDTO.RegenerateUserNatalChartDTO) => {
    const { userId } = dto
    return apiHttpClient.get<NatalChartsNetworkSourcesDTO.NatalChartDTO>(
      `/v1/natal-charts/user/${userId}/regenerate`,
      {
        headers: { 'x-user-id': String(userId) },
      },
    )
  },

  getLatestForUser: (dto: NatalChartsNetworkSourcesDTO.GetLatestForUserDTO) => {
    return apiHttpClient.get<NatalChartsNetworkSourcesDTO.NatalChartDTO>(
      `/v1/natal-charts/user/${dto.userId}/latest`,
      {
        headers: { 'x-user-id': String(dto.userId) },
      },
    )
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
