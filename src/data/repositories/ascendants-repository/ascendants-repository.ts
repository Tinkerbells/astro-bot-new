import type { AscendantsNetworkSources } from '#root/data/sources/ascendants-network-sources/index.js'

import { ascendantsNetworkSources } from '#root/data/sources/ascendants-network-sources/index.js'

import type * as AscendantsRepositoryDTO from './dto.js'

export class AscendantsRepository {
  constructor(private readonly ascendantsNetworkSources: AscendantsNetworkSources) { }

  public async generateGuest(dto: AscendantsRepositoryDTO.GenerateGuestDTO): Promise<AscendantsRepositoryDTO.GuestAscendantResponseDTO> {
    const data = await this.ascendantsNetworkSources.generateGuest(dto)
    return data.data
  }

  public async generateForUser(dto: AscendantsRepositoryDTO.GenerateUserAscendantDTO): Promise<AscendantsRepositoryDTO.AscendantDTO> {
    const data = await this.ascendantsNetworkSources.generateForUser(dto)
    return data.data
  }

  public async create(dto: AscendantsRepositoryDTO.GenerateAscendantDTO): Promise<AscendantsRepositoryDTO.AscendantDTO> {
    const data = await this.ascendantsNetworkSources.create(dto)
    return data.data
  }

  public async findByUserId(dto: AscendantsRepositoryDTO.GetByUserIdDTO): Promise<AscendantsRepositoryDTO.AscendantDTO[]> {
    const data = await this.ascendantsNetworkSources.findByUserId(dto)
    return data.data
  }

  public async findById(dto: AscendantsRepositoryDTO.GetByIdDTO): Promise<AscendantsRepositoryDTO.AscendantDTO> {
    const data = await this.ascendantsNetworkSources.findById(dto)
    return data.data
  }

  public async update(dto: AscendantsRepositoryDTO.UpdateAscendantDTO): Promise<AscendantsRepositoryDTO.AscendantDTO> {
    const data = await this.ascendantsNetworkSources.update(dto)
    return data.data
  }

  public async remove(dto: AscendantsRepositoryDTO.GetByIdDTO): Promise<void> {
    await this.ascendantsNetworkSources.remove(dto)
  }
}

export const ascendantsRepository = new AscendantsRepository(ascendantsNetworkSources)
