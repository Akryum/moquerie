import type { ResourceSchemaType } from '../types/resource.js'
import type { Context } from './context.js'

export async function getResourceSchema(ctx: Context) {
  const schema: {
    types: Record<string, ResourceSchemaType>
  } = {
    types: {},
  }

  if (ctx.config.graphql?.schema) {
    const { getResourceSchema: getGqlResourceSchema } = await import('./graphql/resource.js')
    const gqlSchema = await getGqlResourceSchema(ctx)
    Object.assign(schema.types, gqlSchema.types)
  }

  return schema
}
