import type { ResourceSchema, ResourceSchemaField, ResourceSchemaType } from './types/resource.js'
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

  const types: ResourceSchemaType[] = []

  if (ctx.config.rest?.typeFiles) {
    const { getRestResourceSchema } = await import('./rest/index.js')
    const resourceSchemaFromRest = await getRestResourceSchema(mq)
    types.push(...resourceSchemaFromRest.types)
  }

  let graphqlSchema: ResolvedGraphQLSchema | undefined

  if (ctx.config.graphql?.schema) {
    const { resolveGraphQLSchema, getGraphQLResourceSchema } = await import('./graphql/index.js')
    graphqlSchema = await resolveGraphQLSchema(mq)
    const resourceSchemaFromGraphQL = await getGraphQLResourceSchema(graphqlSchema)
    types.push(...resourceSchemaFromGraphQL.types)
  }

  const sortedTypes = types.sort((a, b) => {
    const aRoot = a.tags.includes('root')
    const bRoot = b.tags.includes('root')
    if (aRoot !== bRoot) {
      return aRoot ? -1 : 1
    }
    if (a.isDeprecated && !b.isDeprecated) {
      return 1
    }
    if (!a.isDeprecated && b.isDeprecated) {
      return -1
    }
    return a.name.localeCompare(b.name)
  })

  for (const type of sortedTypes) {
    schema.types[type.name] = type
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
