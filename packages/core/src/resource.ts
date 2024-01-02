import type { ResourceSchema } from './types/resource.js'
import type { Context } from './context.js'
import type { ResolvedGraphQLSchema } from './graphql/schema.js'

export async function getResourceSchema(ctx: Context) {
  const schema: ResourceSchema = {
    types: {},
    ignoredInExplorer: ctx.config.ignoredResourcesInExplorer,
  }

  let graphqlSchema: ResolvedGraphQLSchema | undefined

  if (ctx.config.graphql?.schema) {
    const { resolveGraphQLSchema, getGraphQLResourceSchema } = await import('./graphql/index.js')
    graphqlSchema = await resolveGraphQLSchema(ctx)
    const resourceSchemaFromGraphQL = await getGraphQLResourceSchema(ctx, graphqlSchema)
    Object.assign(schema.types, resourceSchemaFromGraphQL.types)
  }

  return {
    schema,
    graphqlSchema,
  }
}
