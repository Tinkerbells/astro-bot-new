import { apiHttpClient } from '#root/shared/index.js'

import type * as TarotNetworkSourcesDTO from './dto.js'

export const tarotNetworkSources = {
  createReading: (dto: TarotNetworkSourcesDTO.CreateReadingDTO) => {
    const { userId, ...body } = dto
    return apiHttpClient.post<TarotNetworkSourcesDTO.TarotReadingResponseDTO>(
      `/v1/tarot/reading/${userId}`,
      body,
    )
  },

  getReadingById: (dto: TarotNetworkSourcesDTO.GetReadingByIdDTO) => {
    return apiHttpClient.get<TarotNetworkSourcesDTO.TarotReadingResponseDTO>(
      `/v1/tarot/reading/${dto.readingId}`,
    )
  },

  getReadingsByUserId: (dto: TarotNetworkSourcesDTO.GetReadingsByUserIdDTO) => {
    const { userId, page = 1, limit = 10 } = dto
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    })
    return apiHttpClient.get<TarotNetworkSourcesDTO.InfinityPaginationResponseDTO<TarotNetworkSourcesDTO.TarotReadingResponseDTO>>(
      `/v1/tarot/reading/user/${userId}?${params.toString()}`,
    )
  },

  getReadingsBySocialId: (dto: TarotNetworkSourcesDTO.GetReadingsBySocialIdDTO) => {
    const { socialId, provider, page = 1, limit = 10 } = dto
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    })
    return apiHttpClient.get<TarotNetworkSourcesDTO.InfinityPaginationResponseDTO<TarotNetworkSourcesDTO.TarotReadingResponseDTO>>(
      `/v1/tarot/reading/social/${socialId}/${provider}?${params.toString()}`,
    )
  },

  getSpreads: () => {
    return apiHttpClient.get<TarotNetworkSourcesDTO.TarotSpreadDefinitionDTO[]>(
      '/v1/tarot/reading/spreads',
    )
  },

  updateReading: (dto: TarotNetworkSourcesDTO.UpdateReadingDTO) => {
    const { readingId, ...body } = dto
    return apiHttpClient.patch<TarotNetworkSourcesDTO.TarotReadingResponseDTO>(
      `/v1/tarot/reading/${readingId}`,
      body,
    )
  },
}

export type TarotNetworkSources = typeof tarotNetworkSources
