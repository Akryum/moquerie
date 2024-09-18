import fs from 'node:fs'
import path from 'pathe'
import glob from 'fast-glob'
import SuperJSON from 'superjson'
import type { MoquerieInstance } from '../instance.js'

/**
 * Migrate snapshot folder to new format with each resource type in a single file
 * @param snapshotFolder The snapshot folder to migrate
 * @returns Whether the folder was migrated
 */
export async function migrateSnapshotFolder(mq: MoquerieInstance, snapshotFolder: string) {
  const files = await glob('*/*.json', {
    cwd: snapshotFolder,
    onlyFiles: true,
  })

  if (files.length === 0) {
    return false
  }

  if (mq.data.skipWrites) {
    throw new Error('Cannot migrate snapshot folder in read-only mode')
  }

  const dataPerResource = new Map<string, Record<string, any>>()

  for (const file of files) {
    const [resourceName, filename] = file.split('/')
    const id = path.basename(filename, '.json')
    const filePath = path.join(snapshotFolder, file)
    const content = await fs.promises.readFile(filePath, 'utf8')
    const fileData = SuperJSON.parse(content)
    let dataForResource = dataPerResource.get(resourceName)
    if (!dataForResource) {
      dataForResource = {}
      dataPerResource.set(resourceName, dataForResource)
    }
    dataForResource[id] = fileData
  }

  for (const [resourceName, data] of dataPerResource) {
    const resourceFile = path.join(snapshotFolder, `${resourceName}.res.json`)
    // Sort by key to ensure consistent order
    const sortedData = Object.fromEntries(Object.entries(data).sort(([a], [b]) => a.localeCompare(b)))
    await fs.promises.writeFile(resourceFile, JSON.stringify(SuperJSON.serialize(sortedData), null, 2), 'utf8')
  }

  await Promise.all(files.map(file => fs.promises.rm(path.join(snapshotFolder, file))))

  return true
}
