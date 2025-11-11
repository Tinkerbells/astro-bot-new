import type { TarotNetworkSources } from '#root/data/sources/tarot-network-sources/index.js'

import { tarotNetworkSources } from '#root/data/sources/tarot-network-sources/index.js'

import type * as TarotRepositoryDTO from './dto.js'

export class TarotRepository {
  constructor(private readonly tarotNetworkSources: TarotNetworkSources) { }

  public async createReading(dto: TarotRepositoryDTO.CreateReadingDTO): Promise<TarotRepositoryDTO.TarotReadingResponseDTO> {
    const data = await this.tarotNetworkSources.createReading(dto)
    return data.data
  }

  public async getReadingById(dto: TarotRepositoryDTO.GetReadingByIdDTO): Promise<TarotRepositoryDTO.TarotReadingResponseDTO> {
    const data = await this.tarotNetworkSources.getReadingById(dto)
    return data.data
  }

  public async getReadingsByUserId(dto: TarotRepositoryDTO.GetReadingsByUserIdDTO): Promise<TarotRepositoryDTO.InfinityPaginationResponseDTO<TarotRepositoryDTO.TarotReadingResponseDTO>> {
    const data = await this.tarotNetworkSources.getReadingsByUserId(dto)
    return data.data
  }

  public async getReadingsBySocialId(dto: TarotRepositoryDTO.GetReadingsBySocialIdDTO): Promise<TarotRepositoryDTO.InfinityPaginationResponseDTO<TarotRepositoryDTO.TarotReadingResponseDTO>> {
    const data = await this.tarotNetworkSources.getReadingsBySocialId(dto)
    return data.data
  }

  public async getSpreads(): Promise<TarotRepositoryDTO.TarotSpreadDefinitionDTO[]> {
    const data = await this.tarotNetworkSources.getSpreads()
    return data.data
  }

  public async updateReading(dto: TarotRepositoryDTO.UpdateReadingDTO): Promise<TarotRepositoryDTO.TarotReadingResponseDTO> {
    const data = await this.tarotNetworkSources.updateReading(dto)
    return data.data
  }
}

export const tarotRepository = new TarotRepository(tarotNetworkSources)
