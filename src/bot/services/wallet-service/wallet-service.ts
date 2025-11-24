import type { GetBalanceResponse } from '#root/data/repositories/wallet-repository/dto.js'
import type { WalletRepository } from '#root/data/repositories/wallet-repository/wallet-repository.js'

export class WalletService {
  constructor(private readonly walletRepository: WalletRepository) { }

  async getBalance(userId: string): Promise<GetBalanceResponse> {
    return this.walletRepository.getBalance(userId)
  }
}
