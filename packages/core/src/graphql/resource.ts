import type { ResourceSchemaField, ResourceSchemaType } from '../types/resource.js'
import type { ResolvedGraphQLSchema } from './schema.js'

export async function getGraphQLResourceSchema(graphqlSchema: ResolvedGraphQLSchema) {
  const gqlIntrospection = graphqlSchema.introspection

  const types: ResourceSchemaType[] = []

  const queryName = gqlIntrospection.__schema.queryType?.name ?? 'Query'
  const mutationName = gqlIntrospection.__schema.mutationType?.name ?? 'Mutation'
  const subscriptionName = gqlIntrospection.__schema.subscriptionType?.name ?? 'Subscription'

  const rootTypes = [
    queryName,
    mutationName,
    subscriptionName,
  ]

  for (const gqlType of gqlIntrospection.__schema.types) {
    if (gqlType.name.startsWith('__')) {
      continue
    }

    if (gqlType.kind === 'OBJECT') {
      const fields: Array<ResourceSchemaField> = []
      let inline = true

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
        else if (gqlFieldType.kind === 'OBJECT' || gqlFieldType.kind === 'INTERFACE' || gqlFieldType.kind === 'UNION') {
          type = {
            type: 'resource',
            resourceName: gqlFieldType.name,
          }
        }
        else if (gqlFieldType.kind === 'ENUM') {
          const enumName = gqlFieldType.name
          const enumData = gqlIntrospection.__schema.types.find(t => t.kind === 'ENUM' && t.name === enumName)
          if (!enumData || enumData.kind !== 'ENUM') {
            throw new Error(`Enum ${enumName} not found`)
          }
          type = {
            type: 'enum',
            values: enumData.enumValues.map(v => ({
              value: v.name,
              description: v.description ?? undefined,
              deprecationReason: v.deprecationReason ?? v.isDeprecated ? '' : undefined,
            })),
          }
        }

        const tags = ['graphql', 'field']

        if (field.isDeprecated) {
          tags.push('deprecated')
        }

        if (['id', '_id'].includes(field.name)) {
          inline = false
        }

        const resField: ResourceSchemaField = {
          ...type as ResourceSchemaField,
          name: field.name,
          tags,
          description: field.description ?? undefined,
          array,
          nonNull,
          isDeprecated: field.isDeprecated ?? false,
          deprecationReason: field.deprecationReason ?? undefined,
        }

        fields.push(resField)
      }

      const isRootType = rootTypes.includes(gqlType.name)

      const tags = ['graphql', 'object']
      if (isRootType) {
        tags.push('root')
      }

      // Sort fields
      const sortedFields = fields.sort((a, b) => {
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

      const resType = {
        name: gqlType.name,
        tags,
        description: gqlType.description ?? undefined,
        array: !isRootType,
        fields: sortedFieldsMap,
        nonNull: false,
        isDeprecated: false,
        inline: inline && !isRootType,
      } satisfies ResourceSchemaType

      types.push(resType)
    }
    else if (gqlType.kind === 'INTERFACE' || gqlType.kind === 'UNION') {
      const interfaceType = {
        name: gqlType.name,
        tags: ['graphql', 'interface'],
        description: gqlType.description ?? undefined,
        array: true,
        fields: {},
        nonNull: false,
        isDeprecated: false,
        implementations: gqlType.possibleTypes.map(t => t.name).sort(),
      } satisfies ResourceSchemaType

      types.push(interfaceType)
    }
  }

  // Sort

  return {
    types,
  }
}
