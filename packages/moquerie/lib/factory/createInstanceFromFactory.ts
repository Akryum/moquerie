import { nanoid } from 'nanoid'
import type { Faker } from '@faker-js/faker'
import type { ResourceFactory, ResourceFactoryValue } from '../../types/factory.js'
import type { ResourceInstance, ResourceSchemaType } from '../../types/resource.js'
import { findAllResourceInstances } from '../resource/findAll.js'
import { createResourceInstanceReference } from '../resource/resourceReference.js'
import { runValueCode } from '../util/vm.js'
import { generateValueFromFaker } from './fakerGenerate.js'
import { getFaker } from './fakerGet.js'

export interface CreateInstanceFromFactoryOptions {
  resourceType: ResourceSchemaType
  factory: ResourceFactory
  factoryDataContext: Record<string, any>
  skipEnforceUnique?: boolean
}

export async function createInstanceFromFactory<TType extends ResourceSchemaType = ResourceSchemaType>(options: CreateInstanceFromFactoryOptions): Promise<ResourceInstance<TType>> {
  const { resourceType, factory, factoryDataContext } = options

  const id = nanoid()
  const resourceName = factory.resourceName

  const faker = await getFaker({
    locale: factory.fakerLocale,
    seed: factory.fakerSeed,
  })

  const value = await createResourceValue({
    resourceType,
    factory,
    factoryDataContext,
    faker,
    skipEnforceUnique: !!options.skipEnforceUnique,
  })

  return {
    id,
    resourceName,
    createdAt: new Date(),
    updatedAt: null,
    active: true,
    value,
    tags: factory.applyTags ?? [],
    comment: factory.applyComment || null, // empty string => null
    factoryId: factory.id,
  }
}

export interface CreateResourceValueOptions {
  resourceType: ResourceSchemaType
  factory: ResourceFactory
  factoryDataContext: Record<string, any>
  faker: Faker
  skipEnforceUnique: boolean
}

export async function createResourceValue(options: CreateResourceValueOptions) {
  const { resourceType, factory, factoryDataContext, faker, skipEnforceUnique } = options

  if (resourceType.type === 'object') {
    if (factory.createValue.generateType === 'static') {
      if (!factory.createValue.children) {
        throw new Error(`For object resource: static factory value must have children.`)
      }

      const result: any = {}
      for (const fieldName in factory.createValue.children) {
        const createValue = factory.createValue.children[fieldName]
        const field = resourceType.fields[fieldName]
        const value = result[fieldName] = await createFactoryValue({
          resourceType,
          factory,
          factoryDataContext,
          faker,
          createValue,
          type: field.type,
          array: field.array,
          skipEnforceUnique,
          path: [fieldName],
        })

        // Expose value in data context to be reused in next fields
        factoryDataContext[fieldName] = value
      }
      return result
    }
    else {
      // @TODO
      throw new Error('Not implemented')
    }
  }
  else {
    return await createFactoryValue({
      resourceType,
      factory,
      factoryDataContext,
      faker,
      createValue: factory.createValue,
      type: resourceType.type,
      array: false,
      skipEnforceUnique,
      path: [],
    })
  }
}

export interface CreateFactoryValueOptions {
  resourceType: ResourceSchemaType
  factory: ResourceFactory
  factoryDataContext: Record<string, any>
  faker: Faker
  createValue: ResourceFactoryValue
  type: string
  array: boolean
  skipEnforceUnique: boolean
  path: string[]
}

export async function createFactoryValue(options: CreateFactoryValueOptions) {
  const { resourceType, factory, factoryDataContext, faker, createValue, type, array, skipEnforceUnique } = options

  switch (createValue.generateType) {
    case 'static': {
      if (createValue.staticEvaluated) {
        if (createValue.children) {
          throw new Error(`For staticEvaluated factory value, children are not supported.`)
        }
        if (!createValue.staticValue) {
          throw new Error(`For staticEvaluated factory value, staticValue is required.`)
        }
        const result = await runValueCode(createValue.staticValue, factoryDataContext)

        if (array && !Array.isArray(result)) {
          throw new Error(`Expected array for ${factory.name}#${options.path.join('.')} but got ${typeof result}`)
        }

        return result
      }

      let result: any
      if (createValue.children) {
        result = {}
        for (const fieldName in createValue.children) {
          const child = createValue.children[fieldName]
          result[fieldName] = await createFactoryValue({
            resourceType,
            factory,
            factoryDataContext,
            faker,
            createValue: child,
            type: '', // @TODO nested fields
            array: false, // @TODO nested arrays
            skipEnforceUnique,
            path: [...options.path, fieldName],
          })
        }
      }
      else {
        result = createValue.staticValue
        if (type === 'number') {
          result = Number(result)
        }
        else if (type === 'boolean') {
          result = Boolean(result)
        }
        else if (type === 'date') {
          result = new Date(result)
        }
      }

      if (array && !Array.isArray(result)) {
        return [result]
      }

      return result
    }
    case 'faker': {
      if (!createValue.fakerFactory) {
        throw new Error(`For faker factory value, fakerFactory is required.`)
      }

      function generate() {
        // @TODO handle fakerEnforceUnique
        // if (!skipEnforceUnique) {
        //   encoreUnique()
        // }
        return generateValueFromFaker({
          factory: createValue.fakerFactory!,
          faker,
          paramsCode: createValue.fakerOptions,
          paramsContext: factoryDataContext,
        })
      }

      if (array) {
        const count = createValue.fakerCount == null
          ? 1
          : typeof createValue.fakerCount === 'number' ? createValue.fakerCount : Math.round(Math.random() * (createValue.fakerCount.max - createValue.fakerCount.min) + createValue.fakerCount.min)
        const result = []
        for (let i = 0; i < count; i++) {
          result.push(await generate())
        }
        return result
      }
      else {
        return await generate()
      }
    }
    case 'resourceReference': {
      if (!createValue.resourceTypeName) {
        throw new Error(`For resourceReference factory value, resourceTypeName is required.`)
      }

      if (createValue.resourceRandom) {
        const allInstances = await findAllResourceInstances(createValue.resourceTypeName)
        const randomIndex = Math.floor(Math.random() * allInstances.length)
        const instanceId = [allInstances[randomIndex]?.id].filter(Boolean)

        if (instanceId?.length) {
          if (!array && instanceId.length > 1) {
            throw new Error(`Expected single instance for ${factory.name}#${options.path.join('.')} but got ${instanceId.length}`)
          }
          const refs = instanceId.map(id => createResourceInstanceReference(createValue.resourceTypeName!, id))
          return refs
        }
      }
      else if (createValue.instanceRefs) {
        return createValue.instanceRefs
      }

      return []
    }
  }
}
