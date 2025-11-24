import { walletRepository } from '#root/data/repositories/wallet-repository/wallet-repository.js'

import { WalletService } from './wallet-service.js'

export function createWalletService(): WalletService {
  return new WalletService(walletRepository)
}

export { WalletService }
