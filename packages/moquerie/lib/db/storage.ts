import fs from 'node:fs'
import path from 'pathe'
import createJITI from 'jiti'
import { parse, prettyPrint } from 'recast'
import babelParser from '@babel/parser'
import { builders } from 'ast-types'
import SuperJSON from 'superjson'
import { useQueue } from '../util/queue.js'
import type { DBLocation } from '../../types/db.js'
import { getCwd } from '../util/env.js'
import { createExportedVariable } from '../ast/exportVariable.js'
import { ensureDir } from '../util/fs.js'
import { generateAstFromObject } from '../ast/objectToAst.js'
import { getLocalDbFolder, getRepositoryDbFolder } from './path.js'

const manifestVersion = '0.0.1'
const storageVersion = '0.0.1'

interface Manifest {
  version: string
  files: Record<string, string>
}

export interface UseStorageOptions<TData> {
  name: string
  location: DBLocation
  filename?: (item: TData) => string
  format?: 'js' | 'json'
}

export async function useStorage<TData extends { id: string }>(options: UseStorageOptions<TData>) {
  const getFilename = options.filename ?? ((item: any) => `${item.id}.${options.format ?? 'json'}`)
  const fileFormat = options.format ?? 'json'
  const baseFolder = options.location === 'local'
    ? getLocalDbFolder()
    : getRepositoryDbFolder()
  const folder = path.join(baseFolder, options.name)
  const manifestFile = path.join(folder, 'manifest.json')

  await ensureDir(folder)

  // Read

  const jiti = createJITI(getCwd(), {
    requireCache: false,
  })

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

  let manifest = await readManifest()

  const data: TData[] = []

  function getFilePath(file: string) {
    return path.join(folder, file)
  }

  async function readFile(id: string, file: string) {
    let item
    if (fileFormat === 'js') {
      const mod = await jiti(getFilePath(file))

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
      const content = await fs.promises.readFile(getFilePath(file), 'utf-8')
      const data = SuperJSON.parse(content) as any

      if (!data.version) {
        throw new Error(`Invalid storage file ${file} - missing version`)
      }

      if (data.version !== storageVersion) {
        throw new Error(`Invalid storage file ${file} version ${data.version} - migration not implemented yet`)
      }

      item = data.item
    }
    if (item.id !== id) {
      throw new Error(`Invalid storage file ${file} - id mismatch`)
    }
    return item
  }

  async function load() {
    data.length = 0
    const promises = []
    for (const id in manifest.files) {
      promises.push((async () => {
        const file = manifest.files[id]
        try {
          const item = await readFile(id, file)
          data.push(item)
        }
        catch (e) {
          console.error(e)
        }
      })())
    }
    await Promise.all(promises)
  }

  await load()

  // Write

  const writeQueue = useQueue({
    delay: 1000,
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
    let content: string

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
      content = SuperJSON.stringify({
        version: storageVersion,
        item,
      })
    }

    // Write
    await ensureDir(path.dirname(file))
    await fs.promises.writeFile(file, content!, 'utf-8')
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

  // Refresh reads

  // @TODO better system for reloading files using watch for example

  setInterval(async () => {
    if (!writeQueue.size) {
      manifest = await readManifest()
      await load()
    }
  }, 5000)

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

    // Deduplicate filenames
    let filename = getFilename(item)
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

export type Storage<TData extends { id: string }> = Awaited<ReturnType<typeof useStorage<TData>>>
