import type { ResourceSchema, ResourceSchemaField } from './types/resource.js'
import type { ResolvedGraphQLSchema } from './graphql/schema.js'
import type { MoquerieInstance } from './instance.js'
import type { SchemaTransformStore } from './resource/schemaTransformStore.js'
import { hooks } from './hooks.js'

export async function getResourceSchema(mq: MoquerieInstance, schemaTransformStore: SchemaTransformStore) {
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

  for (const transform of schemaTransformStore.items) {
    await transform.action({
      schema,
      createField: (name, type, options) => {
        return {
          name,
          type,
          array: false,
          ...options,
          tags: ['internal', ...options?.tags ?? []],
        } as ResourceSchemaField
      },
      createEnumField: (name, values) => {
        return {
          name,
          type: 'enum',
          values,
          array: false,
          tags: ['internal'],
        }
      },
      createResourceField: (name, resourceName, array = false) => {
        return {
          name,
          type: 'resource',
          resourceName,
          array,
          tags: ['internal'],
        }
      },
    })
  }

  try {
    await hooks.callHookWith(async (cbs) => {
      for (const cb of cbs) {
        await cb({ schema })
      }
    }, 'transformSchema')
  }
  catch (error: any) {
    console.error(`Error in plugin hook "transformSchema"`, error.stack ?? error)
  }

  return {
    schema,
    graphqlSchema,
  }
}
