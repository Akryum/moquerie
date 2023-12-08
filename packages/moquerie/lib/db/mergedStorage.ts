import { useStorage } from './storage.js'
import type { DBLocation } from '~/types/db.js'

export interface UseMergedStorageOptions {
  name: string
}

export async function useMergedStorage<TData extends { id: string }>(options: UseMergedStorageOptions) {
  const { name } = options
  const storages = {
    local: await useStorage<TData>({
      name,
      location: 'local',
    }),
    repository: await useStorage<TData>({
      name,
      location: 'repository',
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

  async function findById(id: string) {
    const localData = await storages.local.findById(id)
    if (localData) {
      return localData
    }
    const repositoryData = await storages.repository.findById(id)
    return repositoryData
  }

  async function save(item: TData, location: DBLocation) {
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
  }
}

export type MergedStorage<TData extends { id: string }> = ReturnType<typeof useMergedStorage<TData>>
