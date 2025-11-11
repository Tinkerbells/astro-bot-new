import type { TarotNetworkSourcesDTO } from '#root/data/sources/tarot-network-sources/index.js'

export type TarotReadingResponseDTO = TarotNetworkSourcesDTO.TarotReadingResponseDTO
export type TarotReadingCardDTO = TarotNetworkSourcesDTO.TarotReadingCardDTO
export type TarotReadingCardMeaningDTO = TarotNetworkSourcesDTO.TarotReadingCardMeaningDTO
export type TarotSpreadDefinitionDTO = TarotNetworkSourcesDTO.TarotSpreadDefinitionDTO
export type CreateReadingDTO = TarotNetworkSourcesDTO.CreateReadingDTO
export type GetReadingByIdDTO = TarotNetworkSourcesDTO.GetReadingByIdDTO
export type GetReadingsByUserIdDTO = TarotNetworkSourcesDTO.GetReadingsByUserIdDTO
export type GetReadingsBySocialIdDTO = TarotNetworkSourcesDTO.GetReadingsBySocialIdDTO
export type UpdateReadingDTO = TarotNetworkSourcesDTO.UpdateReadingDTO
export type InfinityPaginationResponseDTO<T> = TarotNetworkSourcesDTO.InfinityPaginationResponseDTO<T>
export type TarotSpreadType = TarotNetworkSourcesDTO.TarotSpreadType
export { TarotSpreadTypesEnum } from '#root/data/sources/tarot-network-sources/dto.js'
