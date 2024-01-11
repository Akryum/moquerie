import type { IResolvers, ISchemaLevelResolver } from '@graphql-tools/utils'
import { getResolvedContext } from '../context.js'

export async function createGraphQLResolvers(): Promise<IResolvers> {
  const resolvers: IResolvers = {}

  const ctx = await getResolvedContext()

  for (const resourceName in ctx.schema.types) {
    const resourceType = ctx.schema.types[resourceName]

    // Root types
    if (!resourceType.array) {
      const r = resolvers[resourceName] = {} as Record<any, any>
      if (resourceType.type === 'object') {
        if (resourceType.name === 'Subscription') {
          for (const key in resourceType.fields) {
            r[key] = {
              subscribe: () => ctx.pubSubs.graphql.subscribe(key),
            }
          }

          continue
        }

        for (const key in resourceType.fields) {
          r[key] = async () => {
            const { db } = await getResolvedContext()
            const instance = await db[resourceName].findFirst()
            if (instance) {
              return instance[key]
            }
          }
        }
      }
    }
  }

  // Field actions
  for (const fieldAction of ctx.fieldActions.allActions) {
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
    })
  }

  return resolvers
}
