import { createYoga } from 'graphql-yoga'
import { mergeSchemas } from '@graphql-tools/schema'
import type { MoquerieInstance } from '../instance.js'
import { createGraphQLResolvers } from './resolvers.js'

export async function createYogaServer(mq: MoquerieInstance) {
  const yoga = createYoga({
    schema: async () => {
      const ctx = await mq.getResolvedContext()
      const typeDefsOnlySchema = ctx.graphqlSchema!.schema
      const resolvers = await createGraphQLResolvers(mq)
      const schema = mergeSchemas({
        schemas: [
          typeDefsOnlySchema,
        ],
        resolvers,
      })
      return schema
    },
  })

  return {
    yoga,
  }
}
