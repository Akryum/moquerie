import fs from 'node:fs'
import path from 'pathe'
import SuperJSON from 'superjson'
import type { DatabaseSnapshot } from '../types/snapshot.js'
import type { ResourceInstance } from '../types/resource.js'
import { getSnapshotFolder } from './folder.js'

export async function readSnapshotResourceIds(snapshot: DatabaseSnapshot) {
  const folder = await getSnapshotFolder(snapshot)
  const resourceTypeFolders = (await fs.promises.readdir(folder)).filter(file => fs.statSync(path.join(folder, file)).isDirectory())

  const result: { [resourceName: string]: string[] } = {}

  await Promise.all(resourceTypeFolders.map(async (resourceName) => {
    const resourceFolder = path.join(folder, resourceName)
    const resourceFiles = await fs.promises.readdir(resourceFolder)
    const resourceIds = resourceFiles.map(file => path.basename(file, path.extname(file)))
    result[resourceName] = resourceIds
  }))

  return result
}

export async function readSnapshotResources(snapshot: DatabaseSnapshot, resourceName: string): Promise<ResourceInstance[]> {
  const folder = await getSnapshotFolder(snapshot)
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

export async function readSnapshotAllResources(snapshot: DatabaseSnapshot) {
  const folder = await getSnapshotFolder(snapshot)
  const resourceTypeFolders = (await fs.promises.readdir(folder)).filter(file => fs.statSync(path.join(folder, file)).isDirectory())
  const result: { [resourceName: string]: ResourceInstance[] } = {}

  await Promise.all(resourceTypeFolders.map(async (resourceName) => {
    const resourceFolder = path.join(folder, resourceName)
    const resourceFiles = await fs.promises.readdir(resourceFolder)
    result[resourceName] = await Promise.all(resourceFiles.map(async (file) => {
      const content = await fs.promises.readFile(path.join(resourceFolder, file), 'utf-8')
      return SuperJSON.parse<any>(content).item as ResourceInstance
    }))
  }))

  return result
}
