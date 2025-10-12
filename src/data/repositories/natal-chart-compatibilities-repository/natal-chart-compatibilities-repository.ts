import type { NatalChartCompatibilitiesNetworkSources } from '#root/data/sources/natal-chart-compatibilities-network-sources/index.js'

import { natalChartCompatibilitiesNetworkSources } from '#root/data/sources/natal-chart-compatibilities-network-sources/index.js'

import type * as NatalChartCompatibilitiesRepositoryDTO from './dto.js'

export class NatalChartCompatibilitiesRepository {
  constructor(private readonly natalChartCompatibilitiesNetworkSources: NatalChartCompatibilitiesNetworkSources) { }

  public async createForUserWithGuest(dto: NatalChartCompatibilitiesRepositoryDTO.CreateCompatibilityUserGuestRequestDTO): Promise<NatalChartCompatibilitiesRepositoryDTO.NatalChartCompatibilityDTO> {
    const data = await this.natalChartCompatibilitiesNetworkSources.createForUserWithGuest(dto)
    return data.data
  }

  public async findAllByUserId(userId: number, query?: NatalChartCompatibilitiesRepositoryDTO.FindAllCompatibilitiesQueryDTO): Promise<NatalChartCompatibilitiesRepositoryDTO.InfinityPaginationResultDTO<NatalChartCompatibilitiesRepositoryDTO.NatalChartCompatibilityDTO>> {
    const data = await this.natalChartCompatibilitiesNetworkSources.findAllByUserId(userId, query)
    return data.data
  }

  public async findById(id: string): Promise<NatalChartCompatibilitiesRepositoryDTO.NatalChartCompatibilityDTO> {
    const data = await this.natalChartCompatibilitiesNetworkSources.findById(id)
    return data.data
  }
}

export const natalChartCompatibilitiesRepository = new NatalChartCompatibilitiesRepository(natalChartCompatibilitiesNetworkSources)
