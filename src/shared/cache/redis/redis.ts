import { Redis } from 'ioredis'

export function createRedisClient(url: string) {
  return new Redis(url)
}
