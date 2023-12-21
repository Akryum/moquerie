import { type QueryManager, createQueryManager } from './queryManager.js'

export type QueryManagerProxy = Record<string, QueryManager<any>>

export function createQueryManagerProxy() {
  const cache = new Map<string, QueryManager<any>>()

  const proxy = new Proxy({}, {
    get(_, key: string) {
      if (cache.has(key)) {
        return cache.get(key)
      }

      const queryManager = createQueryManager({
        resourceName: key,
      })
      cache.set(key, queryManager)
      return queryManager
    },
  })

  return proxy as QueryManagerProxy
}
