import type { IResolvers, ISchemaLevelResolver } from '@graphql-tools/utils'
import { nanoid } from 'nanoid'
import { hydrateResourceInstanceReferences } from '../resource/resourceReference.js'
import type { MoquerieInstance } from '../instance.js'

export async function createGraphQLResolvers(mq: MoquerieInstance): Promise<IResolvers> {
  const resolvers: IResolvers = {}

  const ctx = await mq.getResolvedContext()

  for (const resourceName in ctx.schema.types) {
    const resourceType = ctx.schema.types[resourceName]

    // Root types
    if (!resourceType.array) {
      const r = resolvers[resourceName] = {} as Record<any, any>
      if (resourceType.name === 'Subscription') {
        for (const key in resourceType.fields) {
          r[key] = {
            subscribe: () => ctx.pubSubs.graphql.subscribe(key),
            resolve: async (payload: any) => {
              if (!(key in payload)) {
                throw new Error(`Payload does not contain key "${key}": ${JSON.stringify(payload, null, 2)}}`)
              }
              const data = await hydrateResourceInstanceReferences(mq, payload)
              return data[key]
            },
          }
        }

        continue
      }

      for (const key in resourceType.fields) {
        r[key] = async () => {
          const { db } = await mq.getResolvedContext()
          const instance = await db[resourceName].findFirst()
          if (instance) {
            return instance[key]
          }
        }
      }
    }

    // Interface types
    if (resourceType.implementations) {
      const r = resolvers[resourceType.name] = {} as Record<any, any>
      r.__resolveType = (parent: any) => parent.__typename
    }
  }

  // Field actions
  for (const fieldAction of ctx.fieldActions.items) {
    const { resourceName, fieldName, action } = fieldAction
    if (!resolvers[resourceName]) {
      resolvers[resourceName] = {}
    }
    const r = resolvers[resourceName] as Record<string, ISchemaLevelResolver<any, any>>
    r[fieldName] = (parent, input) => action({
      parent,
      input,
      db: ctx.db,
      pubsub: ctx.pubSubs,
      generateId: nanoid,
    })
  }

  return resolvers
}
