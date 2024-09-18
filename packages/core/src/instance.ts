import type { Context, ResolvedContext } from './context.js'
import { getContext, getResolvedContext } from './context.js'
import { type ResourceStorages, applySwitchToBranch } from './resource/storage.js'
import { onSettingsChange } from './settings/onChange.js'
import type { Awaitable } from './util/types.js'

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
