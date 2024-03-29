import { printSchema } from 'graphql'

export default defineEventHandler(async () => {
  const mq = getMq()
  const ctx = await mq.getResolvedContext()
  if (!ctx.graphqlSchema) {
    throw new Error('GraphQL schema not found')
  }
  return {
    schema: printSchema(ctx.graphqlSchema.schema),
    introspection: ctx.graphqlSchema.introspection,
  }
})
