import type { MoquerieInstance } from '../instance.js'
import type { ResourceFactoryField, ResourceFactoryFieldsMap } from '../types/factory.js'
import type { ResourceSchemaType } from '../types/resource.js'
import { autoSelectFakerGenerator } from './fakerAutoSelect.js'

export interface CreateDefaultValueFactoryOptions {
  resourceType: ResourceSchemaType
  randomRefs?: boolean
}

export async function createDefaultFactoryFields(mq: MoquerieInstance, options: CreateDefaultValueFactoryOptions): Promise<ResourceFactoryFieldsMap> {
  const ctx = await mq.getResolvedContext()

  const fields: ResourceFactoryFieldsMap = {}

  const allFields = Object.keys(options.resourceType.fields)

  for (const key in options.resourceType.fields) {
    const typeField = options.resourceType.fields[key]

    let factoryField: ResourceFactoryField

    if (typeField.type === 'resource') {
      const targetResourceType = ctx.schema.types[typeField.resourceName]

      if (targetResourceType.inline) {
        factoryField = {
          type: 'object',
          children: await createDefaultFactoryFields(mq, {
            resourceType: targetResourceType,
            randomRefs: options.randomRefs,
          }),
        }
      }
      else {
        factoryField = options.randomRefs !== false
          ? {
              type: 'db',
              dbFn: 'pickOneRandom',
              dbResource: typeField.resourceName,
            }
          : {
              type: 'null',
            }
      }
    }
    else if (typeField.type === 'enum') {
      factoryField = {
        type: 'pickRandom',
        pickRandomList: JSON.stringify(typeField.values.map(v => v.value)),
        value: typeField.values[0].value,
      }
    }
    else if (typeField.type === 'number') {
      factoryField = {
        type: 'other',
        value: 0,
      }
    }
    else {
      const result = autoSelectFakerGenerator({
        name: key,
        type: typeField.type as any,
        variables: allFields,
        typeName: options.resourceType.name,
      })
      if (result) {
        factoryField = {
          type: 'faker',
          fakerFn: result.factory,
          fakerParams: result.paramsCode,
          lazy: result.selectedVariables.length > 0,
        }
      }
      else {
        factoryField = {
          type: 'other',
          rawCode: 'undefined',
        }
      }
    }

    if (typeField.array) {
      factoryField = {
        type: 'repeat',
        child: factoryField,
        repeatMin: 1,
        repeatMax: 3,
      }
    }

    fields[key] = factoryField
  }

  return fields
}
