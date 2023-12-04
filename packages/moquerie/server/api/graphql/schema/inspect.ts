import { printSchema } from 'graphql'
import { createContext } from '~/lib/context.js'
import { resolveGraphQLSchema, resolveGraphQLSchemaIntrospection } from '~/lib/graphql/schema.js'

export default defineEventHandler(async () => {
  const ctx = await createContext()
  const schema = await resolveGraphQLSchema(ctx)
  const introspection = await resolveGraphQLSchemaIntrospection(ctx)
  return {
    schema: printSchema(schema),
    introspection,
  }
})
