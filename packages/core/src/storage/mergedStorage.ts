import type { MoquerieInstance } from '../instance.js'
import type { DBLocation } from '../types/db.js'
import { type UseStorageOptions, useStorage } from './storage.js'

export type OverrideStorageOptions<TData> = Partial<Omit<UseStorageOptions<TData>, 'location'>>

export type UseMergedStorageOptions<TData> = Omit<UseStorageOptions<TData>, 'location'> & {
  override?: {
    [TLocation in DBLocation]?: OverrideStorageOptions<TData>
  }
}

export async function useMergedStorage<TData extends { id: string, location: DBLocation }>(mq: MoquerieInstance, options: UseMergedStorageOptions<TData>) {
  const storages = {
    local: await useStorage<TData>(mq, {
      ...options,
      location: 'local',
      ...options.override?.local,
    }),
    repository: await useStorage<TData>(mq, {
      ...options,
      location: 'repository',
      ...options.override?.repository,
    }),
  }

  async function findAll() {
    const localData = await storages.local.findAll()
    const repositoryData = await storages.repository.findAll()
    const data = [
      ...localData,
      ...repositoryData,
    ]
    return data
  }

  async function findAllByLocation(location: DBLocation) {
    const data = await storages[location].findAll()
    return data
  }

  async function findById(id: string, location?: DBLocation) {
    if (location) {
      return storages[location].findById(id)
    }
    const localData = await storages.local.findById(id)
    if (localData) {
      return localData
    }
    const repositoryData = await storages.repository.findById(id)
    return repositoryData
  }

  async function save(item: TData, location?: DBLocation) {
    if (location == null) {
      location = item.location
    }
    for (const key of Object.keys(storages) as DBLocation[]) {
      if (key === location) {
        continue
      }
      await storages[key].remove(item.id)
    }
    const data = await storages[location].save(item)
    return data
  }

  async function remove(id: string) {
    await Promise.all([
      storages.local.remove(id),
      storages.repository.remove(id),
    ])
  }

  return {
    findAll,
    findAllByLocation,
    findById,
    save,
    remove,
    ...storages,
  }
}

export type MergedStorage<TData extends { id: string, location: DBLocation }> = Awaited<ReturnType<typeof useMergedStorage<TData>>>
