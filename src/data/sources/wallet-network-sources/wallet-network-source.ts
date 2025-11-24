import { apiHttpClient } from '#root/shared/index.js'

import type { WalletBalance } from './dto.js'

export const walletNetworkSources = {
  getBalance: (userId: string) =>
    apiHttpClient.get<WalletBalance>('/v1/wallet/balance', {
      headers: { 'x-user-id': userId },
    }),
}

export type WalletNetworkSources = typeof walletNetworkSources
