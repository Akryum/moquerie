import { nanoid } from 'nanoid'
import { getResolvedContext } from '../context.js'
import type { ResourceInstance, ResourceInstanceReference, ResourceInstanceValue, ResourceSchemaType } from '../types/resource.js'
import { createResourceInstance } from './createInstance.js'
import { findResourceInstanceById } from './find.js'
import { findAllResourceInstances } from './findAll.js'
import { removeResourceInstanceById } from './remove.js'
import { createResourceInstanceReference } from './resourceReference.js'
import { updateResourceInstanceById } from './update.js'

/**
 * Used to return final values for the API.
 */
export interface QueryManager<TData> {
  findById (id: string): Promise<TData | null>
  findByIdOrThrow (id: string): Promise<TData>
  findMany (predicate?: (data: TData) => boolean): Promise<TData[]>
  findFirst (predicate?: (data: TData) => boolean): Promise<TData | null>
  findFirstOrThrow (predicate: (data: TData) => boolean): Promise<TData>
  create (data: TData): Promise<TData>
  update (id: string, data: Partial<TData>): Promise<TData>
  delete (id: string): Promise<void>
}

export interface CreateQueryManagerOptions {
  resourceName: string
}

/* Caches */

type InstancesCache = Map<string, ResourceInstance[]>

async function getInstancesCached(cache: InstancesCache, resourceName: string) {
  if (cache.has(resourceName)) {
    return cache.get(resourceName)!
  }
  const items = await findAllResourceInstances(resourceName, {
    filterActive: 'active',
  })
  cache.set(resourceName, items)
  return items
}

type InstancesByIdCache = Map<string, Map<string, ResourceInstance>>

async function getInstancesByIdMapCached(instancesCache: InstancesCache, mapCache: InstancesByIdCache, resourceName: string) {
  if (mapCache.has(resourceName)) {
    return mapCache.get(resourceName)!
  }
  const items = await getInstancesCached(instancesCache, resourceName)
  const itemsById = new Map(items.map(item => [item.id, item]))
  mapCache.set(resourceName, itemsById)
  return itemsById
}

/* Deserialize */

interface DeserializeContext {
  /**
   * Prevents infinite recursion when resolving resource instances.
   */
  store: Map<string, any>
  instancesCache: InstancesCache
  instancesByIdCache: InstancesByIdCache
}

/**
 * Create final object from resource instance, included referenced resources.
 */
async function deserializeInstanceValue<TData>(instance: ResourceInstance, deserializeContext: DeserializeContext = {
  store: new Map(),
  instancesCache: new Map(),
  instancesByIdCache: new Map(),
}): Promise<TData> {
  // Cache
  const storeKey = `${instance.resourceName}:${instance.id}`
  if (deserializeContext.store.has(storeKey)) {
    return deserializeContext.store.get(storeKey) as TData
  }

  // Resource type
  const ctx = await getResolvedContext()
  const resourceType = ctx.schema.types[instance.resourceName]
  if (resourceType == null) {
    throw new Error(`Resource type "${instance.resourceName}" not found`)
  }
  if (resourceType.type !== 'object') {
    return instance.value as TData
  }

  /**
   * Final object returned in the API.
   */
  const result = {} as Record<string, any>

  // Cache
  deserializeContext.store.set(storeKey, result)

  for (const key in resourceType.fields) {
    const field = resourceType.fields[key]
    const value = instance.value[key]

    if (field.type === 'resource') {
      const refs = value as ResourceInstanceReference[]

      // Get maps of (only) active instances by id
      const instancesById = await getInstancesByIdMapCached(deserializeContext.instancesCache, deserializeContext.instancesByIdCache, field.resourceName)

      if (field.array) {
        // Pick active referenced instances
        const instances = refs.map(({ __id }) => instancesById.get(__id)).filter(Boolean) as ResourceInstance[]
        // Get final objects for referenced instances
        result[key] = await Promise.all(instances.map(i => deserializeInstanceValue(i, deserializeContext)))
      }
      else {
        // We pick the first active referenced instance
        const firstActiveRef = refs.find(({ __id }) => instancesById.has(__id))
        const refInstance = firstActiveRef ? instancesById.get(firstActiveRef.__id) : null
        if (refInstance) {
          // Get final object for referenced instance
          result[key] = await deserializeInstanceValue(refInstance, deserializeContext)
        }
        else {
          result[key] = null
        }
      }
    }
    else {
      result[key] = value
    }
  }

  return result as TData
}

/* Serialize */

function getIdFromValue(idFields: string[], data: any) {
  return idFields.map(idField => data[idField]).filter(Boolean).join('|')
}

interface SerializeContext {
  /**
   * Prevents infinite recursion when serializing resource instances.
   */
  store: Map<string, ResourceInstanceReference | null>
  instancesCache: InstancesCache
}

/**
 * Create or update referenced resource instances.
 * @param valueId Id of object, should correspond to the idFields of the resource type.
 */
async function serializeInstanceValue<TType extends ResourceSchemaType>(resourceName: string, valueId: string | null, data: ResourceInstanceValue<TType> | null, serializeContext: SerializeContext = {
  store: new Map(),
  instancesCache: new Map(),
}): Promise<ResourceInstanceReference | null> {
  if (typeof data !== 'object') {
    return null
  }

  // Resource type
  const ctx = await getResolvedContext()
  const resourceType = ctx.schema.types[resourceName]
  if (resourceType == null) {
    throw new Error(`Resource type "${resourceName}" not found`)
  }
  if (resourceType.type !== 'object') {
    return null
  }
  const dataAsObject = data as Record<string, any>

  // Id
  const idFields = resourceType.idFields ?? ['id', '_id']
  const getValueId = getIdFromValue.bind(null, idFields)
  if (!valueId) {
    valueId = getValueId(data)
  }

  // Search for existing active instance
  const instances = await getInstancesCached(serializeContext.instancesCache, resourceName)
  let instance = instances.find(i => getValueId(i.value) === valueId)

  const getStoreKey = (resourceName: string, id: string) => `${resourceName}:${id}`

  if (instance) {
    // Already cached
    const storeKey = getStoreKey(instance.resourceName, instance.id)
    if (serializeContext.store.has(storeKey)) {
      return serializeContext.store.get(storeKey)!
    }
  }

  if (data == null) {
    return instance ? createResourceInstanceReference(instance.resourceName, instance.id) : null
  }

  const ref = createResourceInstanceReference(resourceName, instance?.id ?? nanoid())
  const storeKey = getStoreKey(ref.__resourceName, ref.__id)
  serializeContext.store.set(storeKey, ref)

  /**
   * Value stored in the database.
   */
  const resultValue = {} as Record<string, any>

  for (const key in resourceType.fields) {
    const field = resourceType.fields[key]
    const value = dataAsObject[key] === undefined ? instance?.value[key] : dataAsObject[key]

    if (field.type === 'resource') {
      const instanceValues = (Array.isArray(value) ? value : [value]).filter(Boolean) as Array<string | Record<string, any>>

      if (field.array) {
        // Process and save referenced object into database
        const refValues = await Promise.all(instanceValues.map((v) => {
          if (typeof v === 'string') {
            // Just an id
            return serializeInstanceValue(field.resourceName, v, null, serializeContext)
          }
          else {
            // An object
            return serializeInstanceValue(field.resourceName, null, v as any, serializeContext)
          }
        }))
        // Put resource instance references on current object
        resultValue[key] = refValues.filter(Boolean)
      }
      else {
        // Process and save the first valid object or id into database
        let selected: ResourceInstanceReference | null = null
        for (const v of instanceValues) {
          let r: ResourceInstanceReference | null
          if (typeof v === 'string') {
            // Just an id
            r = await serializeInstanceValue(field.resourceName, v, null, serializeContext)
          }
          else {
            // An object
            r = await serializeInstanceValue(field.resourceName, null, v as any, serializeContext)
          }
          if (r) {
            selected = r
            break
          }
        }
        resultValue[key] = selected
      }
    }
    else {
      resultValue[key] = value
    }
  }

  if (instance) {
    instance = await updateResourceInstanceById(resourceName, instance.id, resultValue)
  }
  else {
    instance = await createResourceInstance({
      id: ref.__id,
      resourceName,
      value: resultValue,
      tags: [
        'auto-created',
      ],
    })
  }

  return ref
}

/* Query manager */

export function createQueryManager<TData>(options: CreateQueryManagerOptions): QueryManager<TData> {
  async function findById(id: string): Promise<TData | null> {
    const instance = await findResourceInstanceById(options.resourceName, id)
    if (instance?.active) {
      return deserializeInstanceValue(instance)
    }
    return null
  }

  async function findByIdOrThrow(id: string): Promise<TData> {
    const instance = await findById(id)
    if (instance == null) {
      throw new Error(`Resource instance "${options.resourceName}:${id}" not found`)
    }
    return instance
  }

  async function findMany(predicate?: (data: TData) => boolean): Promise<TData[]> {
    const instances = await findAllResourceInstances(options.resourceName, {
      filterActive: 'active',
    })
    const values = await Promise.all(instances.map(i => deserializeInstanceValue<TData>(i)))
    return predicate ? values.filter(predicate) : values
  }

  async function findFirst(predicate?: (data: TData) => boolean): Promise<TData | null> {
    const values = await findMany()
    return (predicate ? values.find(predicate) : values[0]) ?? null
  }

  async function findFirstOrThrow(predicate?: (data: TData) => boolean): Promise<TData> {
    const value = await findFirst(predicate)
    if (value == null) {
      throw new Error(`Resource instance "${options.resourceName}" not found`)
    }
    return value
  }

  async function create(data: TData): Promise<TData> {
    const result = await serializeInstanceValue(options.resourceName, null, data as any)
    if (result) {
      return findByIdOrThrow(result.__id)
    }
    throw new Error(`Failed to create resource instance ${options.resourceName}: ${JSON.stringify(data)}`)
  }

  async function update(id: string, data: Partial<TData>): Promise<TData> {
    const result = await serializeInstanceValue(options.resourceName, id, data as any)
    if (result) {
      return findByIdOrThrow(result.__id)
    }
    throw new Error(`Failed to update resource instance ${options.resourceName}:${id}`)
  }

  async function _delete(id: string): Promise<void> {
    await removeResourceInstanceById(options.resourceName, id)
  }

  return {
    findById,
    findByIdOrThrow,
    findMany,
    findFirst,
    findFirstOrThrow,
    create,
    update,
    delete: _delete,
  }
}
