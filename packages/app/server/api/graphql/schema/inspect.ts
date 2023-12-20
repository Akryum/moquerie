import { printSchema } from 'graphql'
import { getResolvedContext } from '@moquerie/core'

export default defineEventHandler(async () => {
  const ctx = await getResolvedContext()
  if (!ctx.graphqlSchema) {
    throw new Error('GraphQL schema not found')
  }
  return {
    schema: printSchema(ctx.graphqlSchema.schema),
    introspection: ctx.graphqlSchema.introspection,
  }
})
