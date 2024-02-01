import type { ResourceSchema } from './types/resource.js'
import type { ResolvedGraphQLSchema } from './graphql/schema.js'
import type { MoquerieInstance } from './instance.js'

export async function getResourceSchema(mq: MoquerieInstance) {
  const ctx = await mq.getContext()

  const schema: ResourceSchema = {
    types: {},
    ignoredInExplorer: ctx.config.ignoredResourcesInExplorer,
  }

  let graphqlSchema: ResolvedGraphQLSchema | undefined

  if (ctx.config.graphql?.schema) {
    const { resolveGraphQLSchema, getGraphQLResourceSchema } = await import('./graphql/index.js')
    graphqlSchema = await resolveGraphQLSchema(mq)
    const resourceSchemaFromGraphQL = await getGraphQLResourceSchema(graphqlSchema)
    Object.assign(schema.types, resourceSchemaFromGraphQL.types)
  }

  return {
    schema,
    graphqlSchema,
  }
}
