import { printSchema } from 'graphql'
import { resolveConfig } from '~/lib/config.js'
import { resolveGraphQLSchema, resolveGraphQLSchemaIntrospection } from '~/lib/graphql/schema.js'

export default defineEventHandler(async () => {
  const { config } = await resolveConfig()
  if (!config) {
    throw new Error('config not found')
  }
  const ctx = {
    config,
  }
  const schema = await resolveGraphQLSchema(ctx)
  const introspection = await resolveGraphQLSchemaIntrospection(ctx)
  return {
    schema: printSchema(schema),
    introspection,
  }
})
