import type { MoquerieInstance } from '../instance.js'
import { createBranch } from '../resource/branchCreate.js'
import { getResourceInstanceStorage, switchToBranch } from '../resource/storage.js'
import type { DatabaseSnapshot } from '../types/snapshot.js'
import { readSnapshotAllResources } from './readResources.js'

export interface CreateBranchFromSnapshotOptions {
  snapshot: DatabaseSnapshot
  branchName: string
}

export async function createBranchFromSnapshot(mq: MoquerieInstance, options: CreateBranchFromSnapshotOptions) {
  await createBranch(mq, {
    name: options.branchName,
    empty: true,
  })

  await switchToBranch(mq, options.branchName)

  await writeResources(mq, options.snapshot)
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
