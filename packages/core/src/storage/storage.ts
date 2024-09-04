import fs from 'node:fs'
import path from 'pathe'
import createJITI from 'jiti'
import { parse, prettyPrint } from 'recast'
import babelParser from '@babel/parser'
import { builders } from 'ast-types'
import SuperJSON from 'superjson'
import { useQueue } from '../util/queue.js'
import type { DBLocation } from '../types/db.js'
import { createExportedVariable } from '../ast/exportVariable.js'
import { ensureDir } from '../util/fs.js'
import { generateAstFromObject } from '../ast/objectToAst.js'
import type { Awaitable } from '../util/types.js'
import type { MoquerieInstance } from '../instance.js'
import { getLocalDbFolder, getRepositoryDbFolder } from './path.js'

export const manifestVersion = '0.0.1'
export const storageVersion = '0.0.1'

export interface StorageManifest {
  version: string
  files: Record<string, string>
}

export interface UseStorageOptions<TData> {
  /**
   * Path relative to the computed location.
   */
  path: string
  location: DBLocation
  /**
   * Customize the item file names. By default: `${id}.${format}`
   */
  filename?: (item: TData) => string
  /**
   * Deduplicate file names by adding '-1', '-2', etc. before the extension.
   */
  deduplicateFiles?: boolean
  format?: 'js' | 'json'
  /**
   * Do not load all items initially.
   */
  lazyLoading?: boolean
  /**
   * Transform items before reading or writing them to disk.
   */
  transform?: {
    read?: (item: any, file: string) => Awaitable<TData>
    write?: (item: TData, file: string) => Awaitable<any>
  }
  /**
   * Custom file system implementation.
   */
  file?: {
    read?: (file: string) => Awaitable<any>
    write?: (file: string, data: any) => Awaitable<void>
  }
  manifest?: {
    read?: (folder: string) => Awaitable<StorageManifest>
    write?: (folder: string, manifest: StorageManifest) => Awaitable<void>
  }
}

export async function useStorage<TData extends { id: string }>(mq: MoquerieInstance, options: UseStorageOptions<TData>) {
  const getFilename = options.filename ?? ((item: any) => `${item.id}.${options.format ?? 'json'}`)
  const fileFormat = options.format ?? 'json'
  const baseFolder = options.location === 'local'
    ? getLocalDbFolder(mq)
    : getRepositoryDbFolder(mq)
  const folder = path.join(baseFolder, options.path)
  const manifestFile = path.join(folder, 'manifest.json')
  const shouldWatch = options.location !== 'local' && !mq.data.skipWrites && mq.data.watching

  await ensureDir(folder)

  // Read

  const jiti = createJITI(mq.data.cwd, {
    requireCache: false,
  })

  async function readManifest() {
    if (options.manifest?.read) {
      return options.manifest.read(folder)
    }

    if (!fs.existsSync(manifestFile)) {
      return {
        version: manifestVersion,
        files: {},
      }
    }

    const data = await fs.promises.readFile(manifestFile, 'utf8')
    const manifestResult: StorageManifest = JSON.parse(data)

    if (manifestResult.version !== manifestVersion) {
      throw new Error(`Invalid manifest version ${manifestResult.version} - migration not implemented yet`)
    }

    return manifestResult
  }

  let manifest = await readManifest()

  const data: TData[] = []

  function getFilePath(file: string) {
    return path.join(folder, file)
  }

  async function readFile(id: string, file: string) {
    const filePath = getFilePath(file)
    let item
    if (options.file?.read) {
      item = await options.file.read(filePath)
    }
    else if (fileFormat === 'js') {
      const mod = await jiti(filePath)

      if (!mod.version) {
        throw new Error(`Invalid storage file ${file} - missing version`)
      }
      if (mod.version !== storageVersion) {
        throw new Error(`Invalid storage file ${file} version ${mod.version} - migration not implemented yet`)
      }

      if (!mod.default) {
        throw new Error(`Invalid storage file ${file} - missing default export`)
      }
      item = mod.default
    }
    else if (fileFormat === 'json') {
      const content = await fs.promises.readFile(filePath, 'utf-8')
      const data = SuperJSON.parse(content) as any

      if (!data.version) {
        throw new Error(`Invalid storage file ${file} - missing version`)
      }

      if (data.version !== storageVersion) {
        throw new Error(`Invalid storage file ${file} version ${data.version} - migration not implemented yet`)
      }

      item = data.item
    }
    if (options.transform?.read) {
      item = await options.transform.read(item, file)
    }
    if (item.id !== id) {
      throw new Error(`Invalid storage file ${file} - id mismatch`)
    }
    return item
  }

  // Write

  const writeQueue = useQueue({
    delay: 1000,
  })

  async function writeManifest() {
    if (mq.data.skipWrites) {
      return
    }

    if (options.manifest?.write) {
      return options.manifest.write(folder, manifest)
    }

    await fs.promises.writeFile(manifestFile, JSON.stringify(manifest, null, 2))
  }

  function queueWriteManifest() {
    writeQueue.queue('manifest', writeManifest)
  }

  async function writeFile(item: TData) {
    if (mq.data.skipWrites) {
      return
    }

    const manifestData = manifest.files[item.id]
    if (!manifestData) {
      throw new Error(`Invalid storage file ${item.id} not found in manifest`)
    }
    const file = getFilePath(manifestData)
    await ensureDir(path.dirname(file))

    let content: string

    if (options.transform?.write) {
      item = await options.transform.write(item, file)
    }

    if (options.file?.write) {
      await options.file.write(file, item)
      return
    }

    if (fileFormat === 'js') {
      let ast: any

      const createAstBase = () => parse(`export const version = '${storageVersion}'`, {
        parser: babelParser,
      })

      if (fs.existsSync(file)) {
        try {
          const readContent = await fs.promises.readFile(file, 'utf-8')
          ast = parse(readContent, {
            parser: babelParser,
          })

          // Add export version const if missing
          const versionNode = ast.program.body.find((node: any) => node.type === 'ExportNamedDeclaration' && node.declaration?.declarations[0]?.id.name === 'version')
          if (versionNode) {
            versionNode.declaration.declarations[0].init.value = storageVersion
          }
          else {
            ast.program.body.unshift(createExportedVariable('version', storageVersion))
          }
        }
        catch (e) {
          console.error(e)
          ast = createAstBase()
        }
      }
      else {
        ast = createAstBase()
      }

      const itemAst = generateAstFromObject(item)

      // Update existing default export
      const defaultExport = ast.program.body.find((node: any) => node.type === 'ExportDefaultDeclaration')
      if (defaultExport) {
        defaultExport.declaration = itemAst
      }
      else {
        ast.program.body.push(builders.exportDefaultDeclaration(itemAst))
      }

      // @TODO auto-lint using project's eslint

      content = prettyPrint(ast, { tabWidth: 2 }).code
    }
    else if (fileFormat === 'json') {
      content = JSON.stringify(SuperJSON.serialize({
        version: storageVersion,
        item,
      }), null, 2)
    }

    // Write
    await fs.promises.writeFile(file, content!, 'utf-8')
  }

  function queueWriteFile(item: TData) {
    writeQueue.queue(`item-${item.id}`, () => writeFile(item))
  }

  // Write dead items

  const pendingRemovalFiles = new Set<string>()

  async function removeFiles() {
    if (mq.data.skipWrites) {
      return
    }

    pendingRemovalFiles.forEach((file) => {
      const resolvedPath = getFilePath(file)
      if (fs.existsSync(resolvedPath)) {
        fs.unlinkSync(resolvedPath)
      }
    })
  }

  function queueRemoveFiles() {
    writeQueue.queue('pending-removal-files', removeFiles)
  }

  function removeFile(file: string) {
    if (mq.data.skipWrites) {
      return
    }

    pendingRemovalFiles.add(file)
    queueRemoveFiles()
  }

  // Refresh reads

  // @TODO better system for reloading files using watch for example

  let refreshInterval: NodeJS.Timeout

  if (shouldWatch) {
    refreshInterval = setInterval(async () => {
      if (!writeQueue.busy) {
        manifest = await readManifest()
        await load()
      }
    }, 5000)
  }

  // Data access

  // @TODO optimize by loading only required files

  /**
   * Return all items
   */
  async function findAll(): Promise<TData[]> {
    if (options.lazyLoading) {
      throw new Error('findAll() is not supported with lazyLoading')
    }
    return data
  }

  /**
   * Return item by id
   */
  async function findById(id: string): Promise<TData | undefined> {
    if (options.lazyLoading) {
      const file = manifest.files[id]
      return readFile(id, file)
    }
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

    if (mq.data.skipWrites) {
      return
    }

    // Deduplicate filenames
    let filename = getFilename(item)
    if (options.deduplicateFiles !== false) {
      const ext = path.extname(filename)
      const files = Object.values(manifest.files)
      let testCount = 0
      let testFilename = filename
      while (files.includes(testFilename)) {
        testCount++
        testFilename = filename.replace(ext, `-${testCount}${ext}`)
      }
      if (testCount > 0) {
        filename = testFilename
      }
    }

    manifest.files[item.id] = filename

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

      if (mq.data.skipWrites) {
        return
      }
      const file = manifest.files[id]
      if (file) {
        removeFile(file)
        delete manifest.files[id]
        queueWriteManifest()
      }
    }
  }

  // Load

  async function load() {
    const newData: TData[] = []

    if (!options.lazyLoading) {
      const promises = []
      for (const id in manifest.files) {
        promises.push((async () => {
          const file = manifest.files[id]
          try {
            const item = await readFile(id, file)
            newData.push(item)
          }
          catch (e) {
            console.error(e)
          }
        })())
      }
      await Promise.all(promises)
    }

    // Only update data if no write is pending
    if (!writeQueue.busy) {
      data.length = 0
      data.push(...newData)
    }
  }

  await load()

  // Cleanup

  function destroy() {
    clearInterval(refreshInterval)
    queueWriteManifest()
    data.length = 0
  }

  return {
    findAll,
    findById,
    save,
    remove,
    destroy,
    folder,
    manifest,
  }
}

export type Storage<TData extends { id: string }> = Awaited<ReturnType<typeof useStorage<TData>>>
