import { getContext } from '../context.js'
import { onSettingsChange } from '../settings/onChange.js'
import type { Storage } from '../storage/storage.js'
import { useStorage } from '../storage/storage.js'
import type { ResourceInstance } from '../types/resource.js'

const storage: Map<string, Storage<ResourceInstance>> = new Map()
const storagePromise: Map<string, Promise<Storage<ResourceInstance>>> = new Map()

let currentBranch: string = 'default'

export const resourceInstancesFolders = ['resource-instances', 'branches'] as const

export async function getResourceInstanceStorage(resourceTypeName: string): Promise<Storage<ResourceInstance>> {
  if (storage.has(resourceTypeName)) {
    return storage.get(resourceTypeName)!
  }
  if (storagePromise.has(resourceTypeName)) {
    return storagePromise.get(resourceTypeName)!
  }
  const promise = useStorage<ResourceInstance>({
    path: `${resourceInstancesFolders.join('/')}/${currentBranch}/${resourceTypeName}`,
    location: 'local',
  })
  storagePromise.set(resourceTypeName, promise)
  try {
    const s = await promise
    storage.set(resourceTypeName, s)
    return s
  }
  finally {
    storagePromise.delete(resourceTypeName)
  }
}

// Branch support

function destroyAllStorage() {
  for (const s of storage.values()) {
    s.destroy()
  }
  storage.clear()
  storagePromise.clear()
}

function applySwitchToBranch(branch: string) {
  destroyAllStorage()
  currentBranch = branch
}

onSettingsChange((settings) => {
  if (settings.currentBranch && settings.currentBranch !== currentBranch) {
    applySwitchToBranch(settings.currentBranch)
  }
})

/**
 * Switch the resource instances database to a different branch.
 * @param branch Branch name
 */
export async function switchToBranch(branch: string) {
  if (branch === currentBranch) {
    return
  }
  const ctx = await getContext()
  await ctx.settings.updateSettings({
    currentBranch: branch,
  })
}

/**
 * Get the current branch name of the resource instances database.
 */
export function getCurrentBranch() {
  return currentBranch
}
