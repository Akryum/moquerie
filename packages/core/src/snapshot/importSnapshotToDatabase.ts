import { createBranch } from '../resource/branchCreate.js'
import { getResourceInstanceStorage, switchToBranch } from '../resource/storage.js'
import type { DatabaseSnapshot } from '../types/snapshot.js'
import { readSnapshotAllResources } from './readResources.js'

export interface CreateBranchFromSnapshotOptions {
  snapshot: DatabaseSnapshot
  branchName: string
}

export async function createBranchFromSnapshot(options: CreateBranchFromSnapshotOptions) {
  await createBranch({
    name: options.branchName,
    empty: true,
  })

  await switchToBranch(options.branchName)

  await writeResources(options.snapshot)
}

export interface OverwriteCurrentBranchWithSnapshotOptions {
  snapshot: DatabaseSnapshot
}

export async function overwriteCurrentBranchWithSnapshot(options: OverwriteCurrentBranchWithSnapshotOptions) {
  await writeResources(options.snapshot)
}

async function writeResources(snapshot: DatabaseSnapshot) {
  const resources = await readSnapshotAllResources(snapshot)

  await Promise.all(Object.keys(resources).map(async (resourceName) => {
    const storage = await getResourceInstanceStorage(resourceName)
    await Promise.all(resources[resourceName].map(resource => storage.save(resource)))
  }))
}
