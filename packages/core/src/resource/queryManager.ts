import { nanoid } from 'nanoid'
import { faker } from '@faker-js/faker'
import type { ResourceInstance, ResourceInstanceReference, ResourceInstanceValue, ResourceSchemaField, ResourceSchemaType } from '../types/resource.js'
import type { MoquerieInstance } from '../instance.js'
import { type CreateInstanceOptions, createResourceInstance } from './createInstance.js'
import { findResourceInstanceById } from './find.js'
import { findAllResourceInstances } from './findAll.js'
import { removeResourceInstanceById } from './remove.js'
import { addInstanceValueTag, createResourceInstanceReference, isResourceInstanceReference } from './resourceReference.js'
import { updateResourceInstanceById } from './update.js'
import { getResourceInstanceStorage } from './storage.js'

type QueryManagerCreateInstanceOptions = Omit<CreateInstanceOptions, 'resourceName' | 'value' | 'save'>

export type QueryPredicate<TData> = (data: TData, instance: ResourceInstance) => boolean

/**
 * Used to return final values for the API.
 */
export interface QueryManager<TData> {
  /**
   * Find multiple resource values.
   */
  findMany (predicate?: QueryPredicate<TData>): Promise<TData[]>
  /**
   * Find first resource value that matches the predicate.
   */
  findFirst (predicate?: QueryPredicate<TData>): Promise<TData | null>
  /**
   * Find first resource value that matches the predicate or throw an error if none is found.
   */
  findFirstOrThrow (predicate: QueryPredicate<TData>): Promise<TData>
  /**
   * Create a new resource instance from the supplied data.
   */
  create (data: TData): Promise<TData>
  /**
   * Update multiple resource instances that match the predicate.
   * @param data Will override existing values.
   */
  updateMany (data: Partial<TData>, predicate?: QueryPredicate<TData>): Promise<TData[]>
  /**
   * Update one resource instance that match the predicate.
   * @param data Will override existing values.
   */
  updateFirst (data: Partial<TData>, predicate?: QueryPredicate<TData>): Promise<TData | null>
  /**
   * Delete multiple resource instances that match the predicate.
   */
  delete (predicate: QueryPredicate<TData>): Promise<void>
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
  findFirstReference (predicate?: QueryPredicate<TData>): Promise<ResourceInstanceReference | null>
  /**
   * Find multiple resource instances that match the predicate and return references to them.
   */
  findManyReferences (predicate?: QueryPredicate<TData>): Promise<ResourceInstanceReference[]>
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

async function getInstancesCached(mq: MoquerieInstance, cache: InstancesCache, resourceName: string) {
  if (cache.has(resourceName)) {
    return cache.get(resourceName)!
  }
  const items = await findAllResourceInstances(mq, resourceName, {
    filterActive: 'active',
  })
  cache.set(resourceName, items)
  return items
}

type InstancesByIdCache = Map<string, Map<string, ResourceInstance>>

async function getInstancesByIdMapCached(mq: MoquerieInstance, instancesCache: InstancesCache, mapCache: InstancesByIdCache, resourceName: string) {
  if (mapCache.has(resourceName)) {
    return mapCache.get(resourceName)!
  }
  const items = await getInstancesCached(mq, instancesCache, resourceName)
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
  mq: MoquerieInstance,
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
  const ctx = await mq.getResolvedContext()
  const resourceType = ctx.schema.types[instance.resourceName]
  if (resourceType == null) {
    throw new Error(`Resource type "${instance.resourceName}" not found`)
  }

  /**
   * Final object returned in the API.
   */
  const result = {
    __typename: instance.resourceName,
  } as Record<string, any>

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

        if (field.array) {
          // Get final objects for referenced instances
          result[key] = (await Promise.all(refs.map(async (ref) => {
            // Get maps of (only) active instances by id
            const instancesById = await getInstancesByIdMapCached(mq, deserializeContext.instancesCache, deserializeContext.instancesByIdCache, ref.__resourceName)

            const instance = instancesById.get(ref.__id)
            if (!instance) {
              return null
            }

            return deserializeInstanceValue(mq, instance, deserializeContext)
          }))).filter(Boolean)
        }
        else {
          let refInstance: ResourceInstance | null = null

          // We pick the first active referenced instance
          for (const ref of refs) {
            // Get maps of (only) active instances by id
            const instancesById = await getInstancesByIdMapCached(mq, deserializeContext.instancesCache, deserializeContext.instancesByIdCache, ref.__resourceName)

            const instance = instancesById.get(ref.__id)
            if (instance) {
              refInstance = instance
              break
            }
          }

          if (refInstance) {
          // Get final object for referenced instance
            result[key] = await deserializeInstanceValue(mq, refInstance, deserializeContext)
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
  mq: MoquerieInstance,
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
  const ctx = await mq.getResolvedContext()
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
  const instances = await getInstancesCached(mq, serializeContext.instancesCache, resourceName)
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

      async function processChild(field: ResourceSchemaField & { type: 'resource' }, v: any) {
        let r: ResourceInstanceReference | null
        if (typeof v === 'string') {
          // Just an id
          if (fieldResourceType.implementations) {
            throw new Error(`Error saving ${v}: Cannot reference interface type "${field.resourceName}" as an object with a __typename property is needed`)
          }
          r = await serializeInstanceValue(mq, field.resourceName, v, null, serializeContext)
        }
        else {
          let childResourceName = field.resourceName
          if (fieldResourceType.implementations) {
            if (!v.__typename) {
              throw new Error(`Error saving ${JSON.stringify(v)}: Cannot reference interface type "${field.resourceName}" as an object with a __typename property is needed`)
            }
            childResourceName = v.__typename
          }
          // An object
          r = await serializeInstanceValue(mq, childResourceName, null, v as any, serializeContext)
        }
        return r
      }

      if (fieldResourceType.inline) {
        if (field.array) {
          resultValue[key] = instanceValues.filter(Boolean)
        }
        else {
          resultValue[key] = value
        }
      }
      else {
        // Process and save referenced object into database
        const refValues = await Promise.all(instanceValues.map(v => processChild(field, v)))
        // Put resource instance references on current object
        resultValue[key] = refValues.filter(Boolean)
      }
    }
    else {
      resultValue[key] = value
    }
  }

  if (instance) {
    instance = await updateResourceInstanceById(mq, resourceName, instance.id, { value: resultValue })
  }
  else {
    instance = await createResourceInstance(mq, {
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

export function createQueryManager<TData>(mq: MoquerieInstance, options: CreateQueryManagerOptions): QueryManager<TData> {
  async function findByInstanceId(id: string): Promise<TData | null> {
    const instance = await findResourceInstanceById(mq, options.resourceName, id)
    if (instance?.active) {
      return deserializeInstanceValue(mq, instance)
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

  async function _findMany(predicate?: QueryPredicate<TData>) {
    const instances = await findAllResourceInstances(mq, options.resourceName, {
      filterActive: 'active',
    })
    const result = await Promise.all(instances.map(async i => ({
      instance: i,
      value: await deserializeInstanceValue<TData>(mq, i),
    })))
    return predicate ? result.filter(r => predicate(r.value, r.instance)) : result
  }

  async function findMany(predicate?: QueryPredicate<TData>): Promise<TData[]> {
    return (await _findMany(predicate)).map(r => r.value)
  }

  async function findFirst(predicate?: QueryPredicate<TData>): Promise<TData | null> {
    const refs = await _findMany(predicate)
    return refs[0]?.value ?? null
  }

  async function findFirstOrThrow(predicate?: QueryPredicate<TData>): Promise<TData> {
    const value = await findFirst(predicate)
    if (value == null) {
      throw new Error(`Resource instance "${options.resourceName}" not found`)
    }
    return value
  }

  async function create(data: TData): Promise<TData> {
    const result = await serializeInstanceValue(mq, options.resourceName, null, data as any)
    if (result) {
      return findByInstanceIdOrThrow(result.__id)
    }
    throw new Error(`Failed to create resource instance ${options.resourceName}: ${JSON.stringify(data)}`)
  }

  async function createInstance(data: TData, createOptions: QueryManagerCreateInstanceOptions = {}): Promise<ResourceInstance> {
    const result = await serializeInstanceValue(mq, options.resourceName, null, data as any, undefined, createOptions)
    if (result) {
      const resource = await findResourceInstanceById(mq, result.__resourceName, result.__id)
      if (!resource) {
        throw new Error(`Resource instance not found after create ${options.resourceName}: ${JSON.stringify(data)}`)
      }
      return resource
    }
    throw new Error(`Failed to create resource instance ${options.resourceName}: ${JSON.stringify(data)}`)
  }

  async function selectForChange(predicate?: QueryPredicate<TData>) {
    const instances = await findAllResourceInstances(mq, options.resourceName, {
      filterActive: 'active',
    })
    const valuesWithInstances = await Promise.all(instances.map(async i => ({
      instance: i,
      value: await deserializeInstanceValue<TData>(mq, i),
    })))
    return predicate ? valuesWithInstances.filter(r => predicate(r.value, r.instance)) : valuesWithInstances
  }

  async function updateMany(data: Partial<TData>, predicate?: QueryPredicate<TData>): Promise<TData[]> {
    const selected = await selectForChange(predicate)

    // Update instances
    const result = (await Promise.all(selected.map(r => serializeInstanceValue(mq, options.resourceName, null, {
      ...r.value,
      ...data,
    })))).filter(Boolean) as ResourceInstanceReference[]
    return Promise.all(result.map(r => findByInstanceIdOrThrow(r.__id)))
  }

  async function updateFirst(data: Partial<TData>, predicate?: QueryPredicate<TData>): Promise<TData | null> {
    const selected = (await selectForChange(predicate))[0]
    if (!selected) {
      return null
    }

    // Update instances
    const result = await serializeInstanceValue(mq, options.resourceName, null, {
      ...selected.value,
      ...data,
    })
    if (!result) {
      return null
    }
    return findByInstanceIdOrThrow(result.__id)
  }

  async function _delete(predicate: QueryPredicate<TData>): Promise<void> {
    const selected = await selectForChange(predicate)
    await Promise.all(selected.map(r => removeResourceInstanceById(mq, options.resourceName, r.instance.id)))
  }

  async function pickOneRandom() {
    const storage = await getResourceInstanceStorage(mq, options.resourceName)
    const ids = Object.keys(storage.manifest.files)
    if (!ids.length) {
      return null
    }
    const id = ids[Math.floor(Math.random() * ids.length)]
    return createResourceInstanceReference(options.resourceName, id)
  }

  async function pickManyRandom(min: number, max: number) {
    const storage = await getResourceInstanceStorage(mq, options.resourceName)
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

  async function findFirstReference(predicate?: QueryPredicate<TData>): Promise<ResourceInstanceReference | null> {
    const instance = (await _findMany(predicate))[0]?.instance
    if (instance) {
      return createResourceInstanceReference(instance.resourceName, instance.id)
    }
    return null
  }

  async function findManyReferences(predicate?: QueryPredicate<TData>): Promise<ResourceInstanceReference[]> {
    return (await _findMany(predicate)).map(r => createResourceInstanceReference(r.instance.resourceName, r.instance.id))
  }

  return {
    findMany,
    findFirst,
    findFirstOrThrow,
    create,
    updateMany,
    updateFirst,
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
