import type { WalletNetworkSources } from '#root/data/sources/wallet-network-sources/index.js'

import {
  walletNetworkSources,
} from '#root/data/sources/wallet-network-sources/index.js'

import type { GetBalanceResponse } from './dto.js'

export class WalletRepository {
  constructor(private readonly walletNetworkSources: WalletNetworkSources) { }

  public async getBalance(userId: string): Promise<GetBalanceResponse> {
    const { data } = await this.walletNetworkSources.getBalance(userId)
    return data
  }
}

export const walletRepository = new WalletRepository(
  walletNetworkSources,
)
