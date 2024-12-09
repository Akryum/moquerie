import type { MoquerieInstance } from '../instance.js'
import type { DatabaseSnapshot } from '../types/snapshot.js'
import { nanoid } from 'nanoid'
import { createBranch } from '../resource/branchCreate.js'
import { getResourceInstanceStorage, switchToBranch } from '../resource/storage.js'
import { readSnapshotAllResources } from './readResources.js'
import { getSnapshot } from './storage.js'

export interface CreateBranchFromSnapshotOptions {
  snapshot: DatabaseSnapshot | string
  branchName: string
}

export async function createBranchFromSnapshot(mq: MoquerieInstance, options: CreateBranchFromSnapshotOptions) {
  await createBranch(mq, {
    name: options.branchName,
    empty: true,
  })

  await switchToBranch(mq, options.branchName)

  const snapshot = typeof options.snapshot === 'string'
    ? await getSnapshot(mq, options.snapshot)
    : options.snapshot

  await writeResources(mq, snapshot)
}

export interface OverwriteCurrentBranchWithSnapshotOptions {
  snapshot: DatabaseSnapshot
}

export async function overwriteCurrentBranchWithSnapshot(mq: MoquerieInstance, options: OverwriteCurrentBranchWithSnapshotOptions) {
  await writeResources(mq, options.snapshot)
}

async function writeResources(mq: MoquerieInstance, snapshot: DatabaseSnapshot) {
  const resources = await readSnapshotAllResources(mq, snapshot)

  await Promise.all(Object.keys(resources).map(async (resourceName) => {
    const storage = await getResourceInstanceStorage(mq, resourceName)
    await Promise.all(resources[resourceName].map(resource => storage.save(resource)))
  }))
}

/**
 * Create a new branch with a random name from a snapshot. Useful for tests.
 * @param mq Moquerie instance
 * @param snapshotId Id of the snapshot
 */
export async function useSnapshot(mq: MoquerieInstance, snapshotId: string) {
  return createBranchFromSnapshot(mq, {
    snapshot: snapshotId,
    branchName: `test-${nanoid()}`,
  })
}
