import { getContext } from '../context.js'
import type { MoquerieInstance } from '../instance.js'
import type { Storage } from '../storage/storage.js'
import { useStorage } from '../storage/storage.js'
import type { ResourceInstance } from '../types/resource.js'

export interface ResourceStorages {
  storage: Map<string, Storage<ResourceInstance>>
  storagePromise: Map<string, Promise<Storage<ResourceInstance>>>
  currentBranch: string
}

export const resourceInstancesFolders = ['resource-instances', 'branches'] as const

export async function getResourceInstanceStorage(mq: MoquerieInstance, resourceTypeName: string): Promise<Storage<ResourceInstance>> {
  if (mq.data.resourceStorages.storage.has(resourceTypeName)) {
    return mq.data.resourceStorages.storage.get(resourceTypeName)!
  }
  if (mq.data.resourceStorages.storagePromise.has(resourceTypeName)) {
    return mq.data.resourceStorages.storagePromise.get(resourceTypeName)!
  }
  const promise = useStorage<ResourceInstance>(mq, {
    path: `${resourceInstancesFolders.join('/')}/${mq.data.resourceStorages.currentBranch}/${resourceTypeName}`,
    location: 'local',
    deduplicateFiles: false,
  })
  mq.data.resourceStorages.storagePromise.set(resourceTypeName, promise)
  try {
    const s = await promise
    mq.data.resourceStorages.storage.set(resourceTypeName, s)
    return s
  }
  finally {
    mq.data.resourceStorages.storagePromise.delete(resourceTypeName)
  }
}

// Branch support

function destroyAllStorage(mq: MoquerieInstance) {
  for (const s of mq.data.resourceStorages.storage.values()) {
    s.destroy()
  }
  mq.data.resourceStorages.storage.clear()
  mq.data.resourceStorages.storagePromise.clear()
}

export function applySwitchToBranch(mq: MoquerieInstance, branch: string) {
  destroyAllStorage(mq)
  mq.data.resourceStorages.currentBranch = branch
}

/**
 * Switch the resource instances database to a different branch.
 * @param branch Branch name
 */
export async function switchToBranch(mq: MoquerieInstance, branch: string) {
  if (branch === mq.data.resourceStorages.currentBranch) {
    return
  }
  const ctx = await mq.getContext()
  await ctx.settings.updateSettings({
    currentBranch: branch,
  })
}

/**
 * Get the current branch name of the resource instances database.
 */
export function getCurrentBranch(mq: MoquerieInstance) {
  return mq.data.resourceStorages.currentBranch
}
