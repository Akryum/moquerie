import fs from 'node:fs'
import { getSnapshotFolder, getSnapshotStorage } from '@moquerie/core'
import { copyDir } from '@moquerie/core/util'
import path from 'pathe'
import SuperJSON from 'superjson'

export default defineEventHandler(async (event) => {
  const mq = getMq()
  const { snapshotId } = getRouterParams(event, {
    decode: true,
  }) as {
    snapshotId: string
  }
  const { id, location, description, tags } = await readBody(event)
  const storage = await getSnapshotStorage(mq)
  const snapshot = await storage.findById(snapshotId)
  if (!snapshot) {
    throw new Error(`Snapshot ${snapshotId} not found`)
  }

  // Copy resources
  let foldersToCopy: string[] = []
  if (snapshot.location !== location) {
    const folder = await getSnapshotFolder(mq, snapshot)
    foldersToCopy = (await fs.promises.readdir(folder))
      .filter(file => file !== 'snapshot.json')
      .map(file => path.join(folder, file))
      .filter(file => fs.statSync(file).isDirectory())
  }

  // Rename

  if (snapshot.id !== id) {
    await storage.remove(snapshot.id)
  }

  // Update in storage

  Object.assign(snapshot, {
    id,
    location,
    description,
    tags,
  })
  await storage.save(snapshot)

  // Copy resources
  if (foldersToCopy.length) {
    const folder = await getSnapshotFolder(mq, snapshot)
    await Promise.all(foldersToCopy.map((file) => {
      const dest = path.join(folder, path.basename(file))
      return copyDir(file, dest)
    }))

    await Promise.all(foldersToCopy.map(file => fs.promises.rm(file, { recursive: true })))
  }

  return SuperJSON.stringify(snapshot)
})
