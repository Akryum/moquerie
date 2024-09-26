import process from 'node:process'
import path from 'pathe'
import type { Context, ResolvedContext } from './context.js'
import { getContext, getResolvedContext } from './context.js'
import { type ResourceStorages, applySwitchToBranch, switchToBranch } from './resource/storage.js'
import { onSettingsChange } from './settings/onChange.js'
import type { Awaitable } from './util/types.js'
import { useSnapshot } from './snapshot/importSnapshotToDatabase.js'
import { createEmptyBranch } from './resource/branchCreate.js'
import type { UntypedQueryManagerProxy } from './resource/queryManagerProxy.js'

export interface MoquerieInstance {
  getContext: () => Promise<Context>
  getResolvedContext: () => Promise<ResolvedContext>
  destroy: () => Promise<void>
  onDestroy: (cb: () => Awaitable<void>) => void
  /**
   * @private
   */
  get data (): MoquerieInstanceData
}

export interface MoquerieInstanceData {
  cwd: string
  context: Context | null
  contextPromise: Promise<Context> | null
  resolvedContext: ResolvedContext | null
  resolvedContextPromise: Promise<ResolvedContext> | null
  resolvedContextTime: number
  /**
   * Whether to watch for changes in context, settings...
   */
  watching: boolean
  resourceStorages: ResourceStorages
  onInstanceDestroyCallbacks: Array<() => Awaitable<void>>
  /**
   * Allow skipping writeCode hooks if content hasn't changed
   */
  fileHashes: {
    tsCodegen: {
      resources: string
    }
  }
  skipWrites: boolean
  silent: boolean
}

export interface CreateMoquerieInstanceOptions {
  /**
   * Project directory
   */
  cwd: string
  /**
   * Whether to watch for changes in context, settings...
   *
   * @default true
   */
  watching?: boolean
  /**
   * Don't write database changes to disk.
   */
  skipWrites?: boolean
  /**
   * Don't log to console
   */
  silent?: boolean
}

export async function createMoquerieInstance(options: CreateMoquerieInstanceOptions): Promise<MoquerieInstance> {
  const resourceStorages: ResourceStorages = {
    storage: new Map(),
    storagePromise: new Map(),
    currentBranch: 'default',
  }

  const data: MoquerieInstanceData = {
    cwd: options.cwd,
    context: null,
    contextPromise: null,
    resolvedContext: null,
    resolvedContextPromise: null,
    resolvedContextTime: 0,
    watching: options.watching ?? true,
    resourceStorages,
    onInstanceDestroyCallbacks: [],
    fileHashes: {
      tsCodegen: {
        resources: '',
      },
    },
    skipWrites: options.skipWrites ?? false,
    silent: options.silent ?? false,
  }

  function onDestroy(cb: () => Awaitable<void>) {
    data.onInstanceDestroyCallbacks.push(cb)
  }

  const mq: MoquerieInstance = {
    getContext: () => getContext(mq),
    getResolvedContext: () => getResolvedContext(mq),
    destroy,
    onDestroy,
    get data() {
      return data
    },
  }

  // Watch settings
  // should always watch even if skipWrites is true
  const unwatchSettings = onSettingsChange((settings) => {
    if (settings.currentBranch && settings.currentBranch !== resourceStorages.currentBranch) {
      applySwitchToBranch(mq, settings.currentBranch)
    }
  })
  onDestroy(unwatchSettings)

  async function destroy() {
    for (const cb of data.onInstanceDestroyCallbacks) {
      await cb()
    }
  }

  return mq
}

export interface AdditionalTestInstanceOptions {
  /**
   * Create a new branch from the snapshot.
   */
  snapshot?: string
  /**
   * Switch to an existing branch.
   */
  branch?: string
  /**
   * Create records in the database.
   *
   * Example:
   *
   * ```ts
   * {
   *   create: {
   *     Query: {
   *       hello: 'world',
   *     },
   *     User: [
   *       { name: 'Alice' },
   *       { name: 'Bob' },
   *     ],
   *   }
   * }
   */
  create?: Record<string, Array<Record<string, any>> | Record<string, any>>
}

/**
 * Create a test instance with default options suitable for tests.
 * - `cwd` is set to `process.cwd()`
 * - `watching` is set to `false`
 * - `silent` is set to `true`
 * - `skipWrites` is set to `true`
 *
 * If no `snapshot` or `branch` is provided, an empty branch is created.
 */
export async function createTestInstance(overrideOptions: Partial<CreateMoquerieInstanceOptions> = {}, options: AdditionalTestInstanceOptions = {}): Promise<MoquerieInstance> {
  const instance = await createMoquerieInstance({
    cwd: process.env.MOQUERIE_CWD ? path.resolve(process.cwd(), process.env.MOQUERIE_CWD) : process.cwd(),
    skipWrites: true,
    silent: true,
    watching: false,
    ...overrideOptions,
  })

  if (options.snapshot && options.branch) {
    throw new Error('Cannot provide both snapshot and branch options')
  }

  if (options.snapshot) {
    await useSnapshot(instance, options.snapshot)
  }
  else if (options.branch) {
    await switchToBranch(instance, options.branch)
  }
  else {
    await createEmptyBranch(instance)
  }

  if (options.create) {
    const ctx = await instance.getResolvedContext()

    for (const type in options.create) {
      const items = Array.isArray(options.create[type]) ? options.create[type] : [options.create[type]]
      for (const item of items) {
        await (ctx.db as UntypedQueryManagerProxy)[type].create(item)
      }
    }
  }

  return instance
}
