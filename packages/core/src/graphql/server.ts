import { createYoga } from 'graphql-yoga'
import { getResolvedContext } from '../context.js'

export async function createYogaServer() {
  const yoga = createYoga({
    schema: async () => {
      const ctx = await getResolvedContext()
      return ctx.graphqlSchema!.schema
    },
  })

  return {
    yoga,
  }
}
