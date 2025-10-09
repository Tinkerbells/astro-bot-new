import type { NatalChartsNetworkSources } from '#root/data/sources/natal-charts-network-sources/index.js'

import { natalChartsNetworkSources } from '#root/data/sources/natal-charts-network-sources/index.js'

import type * as NatalChartsRepositoryDTO from './dto.js'

export class NatalChartsRepository {
  constructor(private readonly natalChartsNetworkSources: NatalChartsNetworkSources) { }

  public async generateGuest(dto: NatalChartsRepositoryDTO.GenerateGuestDTO): Promise<NatalChartsRepositoryDTO.GuestNatalChartResponseDTO> {
    const data = await this.natalChartsNetworkSources.generateGuest(dto)
    return data.data
  }

  public async generateForUser(dto: NatalChartsRepositoryDTO.GenerateUserNatalChartDTO): Promise<NatalChartsRepositoryDTO.NatalChartDTO> {
    const data = await this.natalChartsNetworkSources.generateForUser(dto)
    return data.data
  }

  public async regenerateForUser(dto: NatalChartsRepositoryDTO.RegenerateUserNatalChartDTO): Promise<NatalChartsRepositoryDTO.NatalChartDTO> {
    const data = await this.natalChartsNetworkSources.regenerateForUser(dto)
    return data.data
  }

  public async getLatestForUser(dto: NatalChartsRepositoryDTO.GetLatestForUserDTO): Promise<NatalChartsRepositoryDTO.NatalChartDTO> {
    const data = await this.natalChartsNetworkSources.getLatestForUser(dto)
    return data.data
  }

  public async getLatestForSocial(dto: NatalChartsRepositoryDTO.GetLatestForSocialDTO): Promise<NatalChartsRepositoryDTO.NatalChartDTO> {
    const data = await this.natalChartsNetworkSources.getLatestForSocial(dto)
    return data.data
  }

  public async getById(dto: NatalChartsRepositoryDTO.GetByIdDTO): Promise<NatalChartsRepositoryDTO.NatalChartDTO> {
    const data = await this.natalChartsNetworkSources.getById(dto)
    return data.data
  }
}

export const natalChartsRepository = new NatalChartsRepository(natalChartsNetworkSources)
