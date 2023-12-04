import type { ResourceSchemaField, ResourceSchemaType } from '../../types/resource.js'
import type { Context } from '../context.js'
import { resolveGraphQLSchemaIntrospection } from './schema.js'

export async function getResourceSchema(ctx: Context) {
  const gqlIntrospection = await resolveGraphQLSchemaIntrospection(ctx)

  const typesTemp: Record<string, ResourceSchemaType> = {}
  let typesListTemp: ResourceSchemaType[] = []

  const queryName = gqlIntrospection.__schema.queryType?.name ?? 'Query'
  const mutationName = gqlIntrospection.__schema.mutationType?.name ?? 'Mutation'
  const subscriptionName = gqlIntrospection.__schema.subscriptionType?.name ?? 'Subscription'

  for (const gqlType of gqlIntrospection.__schema.types) {
    if (gqlType.name.startsWith('__')) {
      continue
    }

    if (gqlType.kind === 'OBJECT') {
      const fields: Record<string, ResourceSchemaField> = {}

      for (const field of gqlType.fields) {
        let array = false
        let nonNull = false

        let gqlFieldType = field.type
        while (true) {
          if (gqlFieldType.kind === 'NON_NULL') {
            nonNull = true
            gqlFieldType = gqlFieldType.ofType
          }
          else if (gqlFieldType.kind === 'LIST') {
            array = true
            gqlFieldType = gqlFieldType.ofType
          }
          else {
            break
          }
        }

        let type: Partial<ResourceSchemaField> = {}

        if (gqlFieldType.kind === 'SCALAR') {
          if (gqlFieldType.name === 'String' || gqlFieldType.name === 'ID') {
            type = {
              type: 'string',
            }
          }
          else if (gqlFieldType.name === 'Int' || gqlFieldType.name === 'Float') {
            type = {
              type: 'number',
            }
          }
          else if (gqlFieldType.name === 'Boolean') {
            type = {
              type: 'boolean',
            }
          }
          else if (gqlFieldType.name === 'Date') {
            type = {
              type: 'date',
            }
          }
          else {
            type = {
              type: 'any',
            }
          }
        }
        else if (gqlFieldType.kind === 'OBJECT') {
          type = {
            type: 'resource',
            resource: undefined,
          }
        }

        const tags = ['graphql', 'field']

        if (field.isDeprecated) {
          tags.push('deprecated')
        }

        const resField: ResourceSchemaField = {
          ...type as ResourceSchemaField,
          name: field.name,
          tags,
          description: field.description ?? undefined,
          hasAction: false,
          array,
          nonNull,
          deprecationReason: field.deprecationReason ?? undefined,
        }

        fields[resField.name] = resField
      }

      const resType = {
        name: gqlType.name,
        tags: ['graphql', 'object'],
        description: gqlType.description ?? undefined,
        hasAction: false,
        array: gqlType.name !== queryName && gqlType.name !== mutationName && gqlType.name !== subscriptionName,
        type: 'object',
        fields,
        nonNull: false,
      } satisfies ResourceSchemaType

      typesTemp[resType.name] = resType
      typesListTemp.push(resType)
    }
  }

  // Sort

  const types: Record<string, ResourceSchemaType> = {}

  const rootTypes = [
    queryName,
    mutationName,
    subscriptionName,
  ]

  typesListTemp = [
    ...rootTypes.map(n => typesTemp[n]).filter(Boolean),
    ...typesListTemp.filter(t => !rootTypes.includes(t.name)).sort((a, b) => a.name.localeCompare(b.name)),
  ]

  for (const type of typesListTemp) {
    types[type.name] = type
  }

  return {
    types,
  }
}
