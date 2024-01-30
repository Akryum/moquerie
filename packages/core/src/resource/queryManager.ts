import { nanoid } from 'nanoid'
import { faker } from '@faker-js/faker'
import { getResolvedContext } from '../context.js'
import type { ResourceInstance, ResourceInstanceReference, ResourceInstanceValue, ResourceSchemaType } from '../types/resource.js'
import { type CreateInstanceOptions, createResourceInstance } from './createInstance.js'
import { findResourceInstanceById } from './find.js'
import { findAllResourceInstances } from './findAll.js'
import { removeResourceInstanceById } from './remove.js'
import { addInstanceValueTag, createResourceInstanceReference, isResourceInstanceReference } from './resourceReference.js'
import { updateResourceInstanceById } from './update.js'
import { getResourceInstanceStorage } from './storage.js'

type QueryManagerCreateInstanceOptions = Omit<CreateInstanceOptions, 'resourceName' | 'value' | 'save'>

/**
 * Used to return final values for the API.
 */
export interface QueryManager<TData> {
  /**
   * Find multiple resource values.
   */
  findMany (predicate?: (data: TData) => boolean): Promise<TData[]>
  /**
   * Find first resource value that matches the predicate.
   */
  findFirst (predicate?: (data: TData) => boolean): Promise<TData | null>
  /**
   * Find first resource value that matches the predicate or throw an error if none is found.
   */
  findFirstOrThrow (predicate: (data: TData) => boolean): Promise<TData>
  /**
   * Create a new resource instance from the supplied data.
   */
  create (data: TData): Promise<TData>
  /**
   * Update multiple resource instances that match the predicate.
   * @param data Will override existing values.
   */
  update (data: Partial<TData>, predicate?: (data: TData) => boolean): Promise<TData[]>
  /**
   * Delete multiple resource instances that match the predicate.
   */
  delete (predicate: (data: TData) => boolean): Promise<void>
  /**
   * Create a new resource instance from the supplied data.
   * Returns the actual instance.
   */
  createInstance (data: TData, options?: QueryManagerCreateInstanceOptions): Promise<ResourceInstance>
  /**
   * Returns a reference to a resource instance.
   * @param id Instance id.
   */
  getReference (instanceId: string): ResourceInstanceReference
  /**
   * Find first resource instance that matches the predicate and return a reference to it.
   */
  findFirstReference (predicate?: (data: TData) => boolean): Promise<ResourceInstanceReference | null>
  /**
   * Find multiple resource instances that match the predicate and return references to them.
   */
  findManyReferences (predicate?: (data: TData) => boolean): Promise<ResourceInstanceReference[]>
  /**
   * Pick a random resource instance value.
   */
  pickOneRandom (): Promise<ResourceInstanceReference | null>
  /**
   * Pick multiple random resource instance values.
   * @param min Mininum number of instances to pick.
   * @param max Maximum number of instances to pick.
   */
  pickManyRandom (min: number, max: number): Promise<ResourceInstanceReference[]>
  /**
   * @private
   */
  findByInstanceId (id: string): Promise<TData | null>
  /**
   * @private
   */
  findByInstanceIdOrThrow (id: string): Promise<TData>
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
async function deserializeInstanceValue<TData>(
  instance: ResourceInstance,
  deserializeContext: DeserializeContext = {
    store: new Map(),
    instancesCache: new Map(),
    instancesByIdCache: new Map(),
  },
): Promise<TData> {
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
      const fieldResourceType = ctx.schema.types[field.resourceName]
      if (fieldResourceType.inline) {
        result[key] = value
      }
      else {
        const refs = (Array.isArray(value) ? value : [value]).filter(Boolean) as ResourceInstanceReference[]

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
    }
    else {
      result[key] = value
    }
  }

  addInstanceValueTag(result, instance.resourceName, instance.id)

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
 * @param resourceName Name of the resource type.
 * @param valueId Id of object, should correspond to the idFields of the resource type.
 * @param data Object to serialize.
 * @param serializeContext Context used to prevent infinite recursion.
 * @param createOptions Options used to create the resource instance.
 */
async function serializeInstanceValue<TType extends ResourceSchemaType>(
  resourceName: string,
  valueId: string | null,
  data: ResourceInstanceValue<TType> | null,
  serializeContext: SerializeContext = {
    store: new Map(),
    instancesCache: new Map(),
  },
  createOptions: QueryManagerCreateInstanceOptions = {},
): Promise<ResourceInstanceReference | null> {
  if (typeof data !== 'object') {
    return null
  }

  if (isResourceInstanceReference(data)) {
    return data
  }

  // Resource type
  const ctx = await getResolvedContext()
  const resourceType = ctx.schema.types[resourceName]
  if (resourceType == null) {
    throw new Error(`Resource type "${resourceName}" not found`)
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
  let instance = valueId ? instances.find(i => getValueId(i.value) === valueId) : instances[0]

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

  const ref = createResourceInstanceReference(resourceName, instance?.id ?? createOptions.id ?? nanoid())
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
      const instanceValues = (value == null ? [] : Array.isArray(value) ? value : [value]).filter(Boolean) as Array<string | Record<string, any>>

      const fieldResourceType = ctx.schema.types[field.resourceName]

      if (field.array) {
        if (fieldResourceType.inline) {
          resultValue[key] = instanceValues.filter(Boolean)
        }
        else {
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
      }
      else if (fieldResourceType.inline) {
        resultValue[key] = value
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
      ...createOptions,
      id: ref.__id,
      resourceName,
      value: resultValue,
      tags: !createOptions
        ? [
            'auto-created',
          ]
        : [],
      save: true,
    })
  }

  return ref
}

/* Query manager */

export function createQueryManager<TData>(options: CreateQueryManagerOptions): QueryManager<TData> {
  async function findByInstanceId(id: string): Promise<TData | null> {
    const instance = await findResourceInstanceById(options.resourceName, id)
    if (instance?.active) {
      return deserializeInstanceValue(instance)
    }
    return null
  }

  async function findByInstanceIdOrThrow(id: string): Promise<TData> {
    const instance = await findByInstanceId(id)
    if (instance == null) {
      throw new Error(`Resource instance "${options.resourceName}:${id}" not found`)
    }
    return instance
  }

  async function _findMany(predicate?: (data: TData) => boolean) {
    const instances = await findAllResourceInstances(options.resourceName, {
      filterActive: 'active',
    })
    const result = await Promise.all(instances.map(async i => ({
      instance: i,
      value: await deserializeInstanceValue<TData>(i),
    })))
    return predicate ? result.filter(r => predicate(r.value)) : result
  }

  async function findMany(predicate?: (data: TData) => boolean): Promise<TData[]> {
    return (await _findMany(predicate)).map(r => r.value)
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
      return findByInstanceIdOrThrow(result.__id)
    }
    throw new Error(`Failed to create resource instance ${options.resourceName}: ${JSON.stringify(data)}`)
  }

  async function createInstance(data: TData, createOptions: QueryManagerCreateInstanceOptions = {}): Promise<ResourceInstance> {
    const result = await serializeInstanceValue(options.resourceName, null, data as any, undefined, createOptions)
    if (result) {
      const resource = await findResourceInstanceById(result.__resourceName, result.__id)
      if (!resource) {
        throw new Error(`Resource instance not found after create ${options.resourceName}: ${JSON.stringify(data)}`)
      }
      return resource
    }
    throw new Error(`Failed to create resource instance ${options.resourceName}: ${JSON.stringify(data)}`)
  }

  async function selectForChange(predicate?: (data: TData) => boolean) {
    const instances = await findAllResourceInstances(options.resourceName, {
      filterActive: 'active',
    })
    const valuesWithInstances = await Promise.all(instances.map(async i => ({
      instance: i,
      value: await deserializeInstanceValue<TData>(i),
    })))
    return predicate ? valuesWithInstances.filter(({ value }) => predicate(value)) : valuesWithInstances
  }

  async function update(data: Partial<TData>, predicate?: (data: TData) => boolean): Promise<TData[]> {
    const selected = await selectForChange(predicate)

    // Update instances
    const result = (await Promise.all(selected.map(r => serializeInstanceValue(options.resourceName, null, {
      ...r.value,
      ...data,
    })))).filter(Boolean) as ResourceInstanceReference[]
    return Promise.all(result.map(r => findByInstanceIdOrThrow(r.__id)))
  }

  async function _delete(predicate: (data: TData) => boolean): Promise<void> {
    const selected = await selectForChange(predicate)
    await Promise.all(selected.map(r => removeResourceInstanceById(options.resourceName, r.instance.id)))
  }

  async function pickOneRandom() {
    const storage = await getResourceInstanceStorage(options.resourceName)
    const ids = Object.keys(storage.manifest.files)
    if (!ids.length) {
      return null
    }
    const id = ids[Math.floor(Math.random() * ids.length)]
    return createResourceInstanceReference(options.resourceName, id)
  }

  async function pickManyRandom(min: number, max: number) {
    const storage = await getResourceInstanceStorage(options.resourceName)
    const ids = Object.keys(storage.manifest.files)
    const selectedIds = new Set<string>()
    const count = faker.number.int({
      min,
      max,
    })
    while (selectedIds.size < count && ids.length > 0) {
      const index = Math.floor(Math.random() * ids.length)
      const id = ids[index]
      selectedIds.add(id)
      ids.splice(index, 1)
    }
    return Array.from(selectedIds).map(id => createResourceInstanceReference(options.resourceName, id))
  }

  /* Reference manager */

  function getReference(instanceId: string): ResourceInstanceReference {
    return createResourceInstanceReference(options.resourceName, instanceId)
  }

  async function findFirstReference(predicate?: (data: TData) => boolean): Promise<ResourceInstanceReference | null> {
    const instance = (await _findMany(predicate))[0]?.instance
    if (instance) {
      return createResourceInstanceReference(instance.resourceName, instance.id)
    }
    return null
  }

  async function findManyReferences(predicate?: (data: TData) => boolean): Promise<ResourceInstanceReference[]> {
    return (await _findMany(predicate)).map(r => createResourceInstanceReference(r.instance.resourceName, r.instance.id))
  }

  return {
    findMany,
    findFirst,
    findFirstOrThrow,
    create,
    update,
    delete: _delete,
    createInstance,
    getReference,
    findFirstReference,
    findManyReferences,
    pickOneRandom,
    pickManyRandom,
    findByInstanceId,
    findByInstanceIdOrThrow,
  }
}
