import { createYoga } from 'graphql-yoga'
import { mergeSchemas } from '@graphql-tools/schema'
import type { MoquerieInstance } from '../instance.js'
import { hooks } from '../hooks.js'
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
    graphqlEndpoint: mq.data.context?.config.graphql?.basePath ?? '/graphql',
    plugins: [
      {
        onResultProcess: async ({ request, result, setResult }) => {
          const hookResult = await hooks.callHook('beforeSendResponse', {
            response: result,
            type: 'graphql',
            request,
          })
          if (hookResult !== undefined) {
            setResult(hookResult)
          }
        },
      },
    ],
  })

  return {
    yoga,
  }
}
