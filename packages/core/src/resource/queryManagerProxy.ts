import type { MoquerieInstance } from '../instance.js'
import { createQueryManager, type QueryManager } from './queryManager.js'

export interface QueryManagerProxy {}

export type UntypedQueryManagerProxy = Record<string, QueryManager<any>>

export function createQueryManagerProxy(mq: MoquerieInstance) {
  const cache = new Map<string, QueryManager<any>>()

  const proxy = new Proxy({}, {
    get(_, key: string) {
      if (cache.has(key)) {
        return cache.get(key)
      }

      const queryManager = createQueryManager(mq, {
        resourceName: key,
      })
      cache.set(key, queryManager)
      return queryManager
    },
  })

  return proxy as QueryManagerProxy
}
