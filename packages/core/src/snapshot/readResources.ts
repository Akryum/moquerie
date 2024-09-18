import fs from 'node:fs'
import path from 'pathe'
import SuperJSON from 'superjson'
import glob from 'fast-glob'
import type { DatabaseSnapshot } from '../types/snapshot.js'
import type { ResourceInstance } from '../types/resource.js'
import type { MoquerieInstance } from '../instance.js'
import { getSnapshotFolder } from './folder.js'
import { migrateSnapshotFolder } from './migrate.js'

export async function readSnapshotResourceIds(mq: MoquerieInstance, snapshot: DatabaseSnapshot) {
  const folder = await getSnapshotFolder(mq, snapshot)

  const result: { [resourceName: string]: string[] } = {}

  const resourceFiles = await glob('*.res.json', {
    cwd: folder,
    onlyFiles: true,
  })
  if (resourceFiles.length) {
    // New format with each resource type in a single file

    await Promise.all(resourceFiles.map(async (file) => {
      const resourceName = path.basename(file, '.res.json')
      const content = await fs.promises.readFile(path.join(folder, file), 'utf-8')
      const data = SuperJSON.parse<any>(content)
      result[resourceName] = Object.keys(data)
    }))
  }
  else {
    // Old format with files inside resource folders

    const resourceTypeFolders = (await fs.promises.readdir(folder)).filter(file => fs.statSync(path.join(folder, file)).isDirectory())

    await Promise.all(resourceTypeFolders.map(async (resourceName) => {
      const resourceFolder = path.join(folder, resourceName)
      const resourceFiles = await fs.promises.readdir(resourceFolder)
      const resourceIds = resourceFiles.map(file => path.basename(file, path.extname(file)))
      result[resourceName] = resourceIds
    }))
  }

  return result
}

export async function readSnapshotResources(mq: MoquerieInstance, snapshot: DatabaseSnapshot, resourceName: string): Promise<ResourceInstance[]> {
  const folder = await getSnapshotFolder(mq, snapshot)
  const resourceFile = path.join(folder, `${resourceName}.res.json`)

  // New format with each resource type in a single file
  if (fs.existsSync(resourceFile)) {
    const content = await fs.promises.readFile(resourceFile, 'utf-8')
    const data = SuperJSON.parse<any>(content)
    return Object.values<any>(data).map(({ item }) => item as ResourceInstance)
  }

  // Old format with files inside resource folders
  const resourceFolder = path.join(folder, resourceName)
  if (!fs.existsSync(resourceFolder)) {
    return []
  }
  const resourceFiles = await fs.promises.readdir(resourceFolder)
  const resources = await Promise.all(resourceFiles.map(async (file) => {
    const content = await fs.promises.readFile(path.join(resourceFolder, file), 'utf-8')
    return SuperJSON.parse<any>(content).item as ResourceInstance
  }))
  return resources
}

export async function readSnapshotAllResources(mq: MoquerieInstance, snapshot: DatabaseSnapshot) {
  const folder = await getSnapshotFolder(mq, snapshot)

  await migrateSnapshotFolder(mq, folder)

  const result: { [resourceName: string]: ResourceInstance[] } = {}

  const resourceFiles = await glob('*.res.json', {
    cwd: folder,
    onlyFiles: true,
  })
  await Promise.all(resourceFiles.map(async (file) => {
    const resourceName = path.basename(file, '.res.json')
    const content = await fs.promises.readFile(path.join(folder, file), 'utf-8')
    const data = SuperJSON.parse<any>(content)
    result[resourceName] = Object.values<any>(data).map(({ item }) => item as ResourceInstance)
  }))

  return result
}
