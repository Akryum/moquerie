import { printSchema } from 'graphql'
import { createContext, resolveGraphQLSchema, resolveGraphQLSchemaIntrospection } from '@moquerie/core'

export default defineEventHandler(async () => {
  const ctx = await createContext()
  const schema = await resolveGraphQLSchema(ctx)
  const introspection = await resolveGraphQLSchemaIntrospection(ctx)
  return {
    schema: printSchema(schema),
    introspection,
  }
})
