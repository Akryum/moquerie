import { createYoga } from 'graphql-yoga'
import { mergeSchemas } from '@graphql-tools/schema'
import { getResolvedContext } from '../context.js'
import { createGraphQLResolvers } from './resolvers.js'

export async function createYogaServer() {
  const yoga = createYoga({
    schema: async () => {
      const ctx = await getResolvedContext()
      const typeDefsOnlySchema = ctx.graphqlSchema!.schema
      const resolvers = await createGraphQLResolvers()
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
