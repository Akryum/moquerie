import type { ResourceFactoryValue } from '../types/factory.js'
import type { ResourceSchemaType } from '../types/resource.js'
import { autoSelectFakerGenerator } from './fakerAutoSelect.js'

export interface CreateDefaultValueFactoryOptions {
  resourceType: ResourceSchemaType
  randomRefs?: boolean
}

export function createDefaultValueFactory(options: CreateDefaultValueFactoryOptions): ResourceFactoryValue {
  if (options.resourceType.type === 'object') {
    const children: Record<string, ResourceFactoryValue> = {}

    const allFields = Object.keys(options.resourceType.fields)

    for (const key in options.resourceType.fields) {
      const field = options.resourceType.fields[key]

      if (field.type === 'resource') {
        children[key] = {
          generateType: 'resourceReference',
          resourceTypeName: field.resourceName,
          resourceRandom: options.randomRefs !== false,
        }
        continue
      }

      if (field.type === 'enum') {
        children[key] = {
          generateType: 'static',
          staticValue: field.values[0].value,
        }
        continue
      }

      const result = autoSelectFakerGenerator({
        name: key,
        type: field.type as any,
        variables: allFields,
        typeName: options.resourceType.name,
      })
      if (result) {
        children[key] = {
          generateType: 'faker',
          fakerFactory: result.factory,
          fakerOptions: result.paramsCode,
          fakerCount: field.array ? 1 : undefined,
          fakerEnforceUnique: field.name.match(/id/) != null,
        }
      }
      else {
        children[key] = {
          generateType: 'static',
          staticValue: '',
        }
      }
    }
    return {
      generateType: 'static',
      children,
    }
  }
  else {
    const result = autoSelectFakerGenerator({
      name: options.resourceType.name,
      type: options.resourceType.type as any,
    })
    if (result) {
      return {
        generateType: 'faker',
        fakerFactory: result.factory,
        fakerOptions: result.paramsCode,
        fakerCount: options.resourceType.array ? 1 : undefined,
      }
    }
  }

  return {
    generateType: 'static',
    staticValue: '',
  }
}
