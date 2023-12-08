import fs from 'node:fs'
import path from 'pathe'
import SuperJSON from 'superjson'
import { useQueue } from '../util/queue.js'
import type { DBLocation } from '../../types/db.js'
import { getLocalDbFolder, getRepositoryDbFolder } from './path.js'

const manifestVersion = '0.0.1'
const storageVersion = '0.0.1'

interface Manifest {
  version: string
  files: Record<string, string>
}

export interface UseStorageOptions {
  name: string
  location: DBLocation
}

export async function useStorage<TData extends { id: string }>(options: UseStorageOptions) {
  const baseFolder = options.location === 'local'
    ? getLocalDbFolder()
    : getRepositoryDbFolder()
  const folder = path.join(baseFolder, options.name)
  const manifestFile = path.join(folder, 'manifest.json')

  if (!fs.existsSync(folder)) {
    await fs.promises.mkdir(folder, { recursive: true })
  }

  // Read

  async function readManifest() {
    if (!fs.existsSync(manifestFile)) {
      return {
        version: manifestVersion,
        files: {},
      }
    }

    const data = await fs.promises.readFile(manifestFile, 'utf8')
    const manifestResult: Manifest = JSON.parse(data)

    if (manifestResult.version !== manifestVersion) {
      throw new Error(`Invalid manifest version ${manifestResult.version} - migration not implemented yet`)
    }

    return manifestResult
  }

  const manifest = await readManifest()

  const data: TData[] = []

  function getFilePath(file: string) {
    return path.join(folder, file)
  }

  async function readFile(id: string, file: string) {
    const content = await fs.promises.readFile(getFilePath(file), 'utf8')
    const firstLineIndex = content.indexOf('\n')
    if (firstLineIndex === -1) {
      throw new Error(`Invalid storage file ${file}`)
    }
    const version = content.slice(0, firstLineIndex)
    if (version !== storageVersion) {
      throw new Error(`Invalid storage file version ${version} - migration not implemented yet`)
    }

    const jsonRaw = content.slice(firstLineIndex + 1)
    const item = SuperJSON.parse<TData>(jsonRaw)
    if (item.id !== id) {
      throw new Error(`Invalid storage file ${file} - id mismatch`)
    }
    return item
  }

  async function load() {
    for (const id in manifest.files) {
      const file = manifest.files[id]
      const item = await readFile(id, file)
      data.push(item)
    }
  }

  await load()

  // Write

  const writeQueue = useQueue({
    delay: 5000,
  })

  async function writeManifest() {
    await fs.promises.writeFile(manifestFile, JSON.stringify(manifest, null, 2))
  }

  function queueWriteManifest() {
    writeQueue.queue('manifest', writeManifest)
  }

  async function writeFile(item: TData) {
    const manifestData = manifest.files[item.id]
    if (!manifestData) {
      throw new Error(`Invalid storage file ${item.id} not found in manifest`)
    }
    const file = getFilePath(manifestData)
    const { json, meta } = SuperJSON.serialize(item)
    const jsonRaw = JSON.stringify({ json, meta }, null, 2)
    const content = `${storageVersion}\n${jsonRaw}`
    await fs.promises.writeFile(file, content, 'utf-8')
  }

  function queueWriteFile(item: TData) {
    writeQueue.queue(`item-${item.id}`, () => writeFile(item))
  }

  // Write dead items

  const pendingRemovalFiles = new Set<string>()

  async function removeFiles() {
    pendingRemovalFiles.forEach((file) => {
      fs.unlinkSync(getFilePath(file))
    })
  }

  function queueRemoveFiles() {
    writeQueue.queue('pending-removal-files', removeFiles)
  }

  function removeFile(file: string) {
    pendingRemovalFiles.add(file)
    queueRemoveFiles()
  }

  // Data access

  // @TODO optimize by loading only required files

  /**
   * Return all items
   */
  async function findAll() {
    return data
  }

  /**
   * Return item by id
   */
  async function findById(id: string) {
    return data.find(item => item.id === id)
  }

  /**
   * Add or update an item
   */
  async function save(item: TData) {
    const index = data.findIndex(i => i.id === item.id)
    if (index === -1) {
      data.push(item)
    }
    else {
      data[index] = item
    }
    manifest.files[item.id] = `${item.id}.json`
    queueWriteFile(item)
    queueWriteManifest()
  }

  /**
   * Remove an item
   */
  async function remove(id: string) {
    const index = data.findIndex(i => i.id === id)
    if (index !== -1) {
      data.splice(index, 1)
      const file = manifest.files[id]
      if (file) {
        removeFile(file)
        delete manifest.files[id]
        queueWriteManifest()
      }
    }
  }

  return {
    findAll,
    findById,
    save,
    remove,
  }
}

export type Storage<TData extends { id: string }> = ReturnType<typeof useStorage<TData>>
