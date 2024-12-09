import type { IResolvers, ISchemaLevelResolver } from '@graphql-tools/utils'
import type { MoquerieInstance } from '../instance.js'
import type { UntypedQueryManagerProxy } from '../resource/queryManagerProxy.js'
import { nanoid } from 'nanoid'
import { hydrateResourceInstanceReferences } from '../resource/resourceReference.js'
import GraphQLJSON, { GraphQLJSONObject } from './json.js'

export async function createGraphQLResolvers(mq: MoquerieInstance): Promise<IResolvers> {
  const resolvers: IResolvers = {}

  const ctx = await mq.getResolvedContext()
  const graphqlSchema = ctx.graphqlSchema!
  const gqlIntrospection = graphqlSchema.introspection

  // Default resolvers
  if (gqlIntrospection.__schema.types.some(type => type.kind === 'SCALAR' && type.name === 'JSON')) {
    resolvers.JSON = GraphQLJSON
  }
  if (gqlIntrospection.__schema.types.some(type => type.kind === 'SCALAR' && type.name === 'JSONObject')) {
    resolvers.JSONObject = GraphQLJSONObject
  }

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
          const instance = await (db as UntypedQueryManagerProxy)[resourceName].findFirst()
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

  // Resolvers
  for (const resolver of ctx.resolvers.items) {
    const { resourceName, fieldName, action } = resolver
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
