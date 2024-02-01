import fs from 'node:fs'
import path from 'pathe'
import { getSnapshotFolder, getSnapshotStorage } from '@moquerie/core'
import SuperJSON from 'superjson'
import { copyDir } from '@moquerie/core/util'

export default defineEventHandler(async (event) => {
  const mq = getMq()
  const { id, location, description, tags } = await readBody(event)
  const storage = await getSnapshotStorage(mq)
  const snapshot = await storage.findById(id)
  if (!snapshot) {
    throw new Error(`Snapshot ${id} not found`)
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

  // Update in storage

  Object.assign(snapshot, {
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
