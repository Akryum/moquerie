import type { ResourceSchema, ResourceSchemaField, ResourceSchemaType } from './types/resource.js'
import type { ResolvedGraphQLSchema } from './graphql/schema.js'
import type { MoquerieInstance } from './instance.js'
import type { SchemaTransformStore } from './resource/schemaTransformStore.js'
import { hooks } from './hooks.js'
import { type PartialResourceSchemaType, getTypesFromFile } from './resource/fromTypes.js'

export async function getResourceSchema(mq: MoquerieInstance, schemaTransformStore: SchemaTransformStore) {
  const ctx = await mq.getContext()

  const types: Array<ResourceSchemaType | PartialResourceSchemaType> = []

  // REST

  if (ctx.config.rest?.typeFiles) {
    const { getRestResourceSchema } = await import('./rest/index.js')
    const resourceSchemaFromRest = await getRestResourceSchema(mq)
    types.push(...resourceSchemaFromRest.types)
  }

  // GraphQL

  let graphqlSchema: ResolvedGraphQLSchema | undefined

  if (ctx.config.graphql?.schema) {
    const { resolveGraphQLSchema, getGraphQLResourceSchema } = await import('./graphql/index.js')
    graphqlSchema = await resolveGraphQLSchema(mq)
    const resourceSchemaFromGraphQL = await getGraphQLResourceSchema(graphqlSchema)
    types.push(...resourceSchemaFromGraphQL.types)
  }

  // Extend

  if (ctx.config.extendTypes?.typeFiles) {
    const { types: extendTypes } = await getTypesFromFile(mq, ctx.config.extendTypes.typeFiles, ['extended'])
    types.push(...extendTypes)
  }

  // Merge

  const mergeMap = new Map<string, ResourceSchemaType>()
  const mergedTypes: ResourceSchemaType[] = []

  for (const type of types) {
    // Merge types
    if (mergeMap.has(type.name)) {
      const existingType = mergeMap.get(type.name)!
      // Merge other properties
      Object.entries(type).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'fields') {
            // Merge fields
            for (const fieldName in type.fields) {
              const field = type.fields[fieldName]
              const existingField = existingType.fields[fieldName]
              if (existingField) {
                if (existingField.type !== field.type) {
                  throw new Error(`Field "${type.name}.${fieldName}" is defined with different types in different sources`)
                }
                Object.entries(field).forEach(([key, value]) => {
                  if (value !== undefined) {
                    if (key === 'tags') {
                      existingField.tags = Array.from(new Set([...existingField.tags, ...field.tags]))
                    }
                    else if (key === 'meta') {
                      existingField.meta = {
                        ...existingField.meta,
                        ...field.meta,
                      }
                    }
                    else {
                      // @ts-expect-error tired of ts
                      existingField[key] = value
                    }
                  }
                })
              }
              else {
                existingType.fields[fieldName] = field
              }
            }
          }
          else if (key === 'tags') {
            existingType.tags = Array.from(new Set([...existingType.tags, ...type.tags]))
          }
          else if (key === 'meta') {
            existingType.meta = {
              ...existingType.meta,
              ...type.meta,
            }
          }
          else {
            // @ts-expect-error tired of ts
            existingType[key] = value
          }
        }
      })
    }
    else {
      mergeMap.set(type.name, type as ResourceSchemaType)
      mergedTypes.push(type as ResourceSchemaType)
    }
  }

  // Sort fields

  for (const type of mergedTypes) {
    const sortedFields = Object.values(type.fields).sort((a, b) => {
      if (a.name === 'id' || a.name === '_id') {
        return -1
      }
      if (b.name === 'id' || b.name === '_id') {
        return 1
      }
      if (a.isDeprecated && !b.isDeprecated) {
        return 1
      }
      if (!a.isDeprecated && b.isDeprecated) {
        return -1
      }
      return a.name.localeCompare(b.name)
    })
    const sortedFieldsMap: Record<string, ResourceSchemaField> = {}
    for (const field of sortedFields) {
      sortedFieldsMap[field.name] = field
    }
    type.fields = sortedFieldsMap
  }

  // Sort types

  const sortedTypes = mergedTypes.sort((a, b) => {
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

  // Final schema

  const schema: ResourceSchema = {
    types: {},
    ignoredInExplorer: ctx.config.ignoredResourcesInExplorer,
  }

  for (const type of sortedTypes) {
    schema.types[type.name] = type
  }

  // Apply transforms

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
