import { FSWatcher } from 'chokidar'
import { checkPort, getPort } from 'get-port-please'
import path from 'pathe'
import { debounce } from 'perfect-debounce'
import type { JITI } from 'jiti'
import createJITI from 'jiti'
import type { Config } from './types/config.js'
import { resolveConfig } from './config/resolve.js'
import type { ResourceSchema } from './types/resource.js'
import { getResourceSchema } from './resource.js'
import type { Server } from './server.js'
import { createServer } from './server.js'
import type { ResolvedGraphQLSchema } from './graphql/schema.js'
import { type QueryManagerProxy, createQueryManagerProxy } from './resource/queryManagerProxy.js'
import type { FieldActionWatcher } from './fieldActions/fieldActionWatcher.js'
import { createFieldActionWatcher } from './fieldActions/fieldActionWatcher.js'
import { type SettingsManager, createSettingsManager } from './settings/settingsManager.js'
import { type PubSubs, createPubSubs } from './pubsub/createPubSub.js'
import type { MoquerieInstance } from './instance.js'
import type { HistoryRecord } from './types/history.js'

export interface Context {
  contextWatcher: FSWatcher
  config: Config
  settings: SettingsManager
  port: number
}

async function getContextRelatedToConfig(mq: MoquerieInstance) {
  const { config } = await resolveConfig(mq.data.cwd)
  let port = mq.data.context?.port
  if (!mq.data.context || !port || mq.data.context?.config.server?.port !== config?.server?.port) {
    port = await getPort({
      port: config?.server?.port ?? 5658,
    })
  }
  return {
    config: config ?? {},
    port,
  }
}

async function createContext(mq: MoquerieInstance): Promise<Context> {
  const contextWatcher = new FSWatcher({
    ignoreInitial: true,
  })

  // Watch config file
  const cwd = mq.data.cwd
  const configExt = ['ts', 'js', 'mjs', 'cjs', 'cts', 'mts', 'json']
  configExt.forEach((ext) => {
    contextWatcher.add(path.resolve(cwd, `moquerie.config.${ext}`))
  })

  // Context change
  async function onContextChange() {
    const context = await getContext(mq)
    Object.assign(context, await getContextRelatedToConfig(mq))
    // Reset resolved context timer so it's re-evaluated
    mq.data.resolvedContextTime = 0
  }

  contextWatcher.on('all', debounce(onContextChange, 100))

  mq.onDestroy(() => contextWatcher.close())

  // Settings
  const settings = await createSettingsManager(mq)

  return {
    contextWatcher,
    settings,
    ...await getContextRelatedToConfig(mq),
  }
}

export async function getContext(mq: MoquerieInstance): Promise<Context> {
  if (mq.data.context) {
    return mq.data.context
  }

  if (mq.data.contextPromise) {
    return mq.data.contextPromise
  }

  mq.data.contextPromise = createContext(mq)
  try {
    mq.data.context = await mq.data.contextPromise
    return mq.data.context
  }
  finally {
    mq.data.contextPromise = null
  }
}

/**
 * Need context to be resolved first
 */
export interface ResolvedContext {
  context: Context
  schema: ResourceSchema
  graphqlSchema?: ResolvedGraphQLSchema
  server: Server
  fieldActions: FieldActionWatcher
  // @TODO type
  db: QueryManagerProxy
  // @TODO type
  pubSubs: PubSubs
  jiti: JITI
  historyRecords: Array<HistoryRecord>
}

async function createResolvedContext(mq: MoquerieInstance): Promise<ResolvedContext> {
  const ctx = await mq.getContext()

  const { schema, graphqlSchema } = await getResourceSchema(mq)

  let server = mq.data.resolvedContext?.server
  if (server) {
    if (mq.data.resolvedContext?.context.port !== ctx.port) {
      await server.restart()
    }
  }
  else {
    server = await createServer(mq)
  }

  let fieldActions = mq.data.resolvedContext?.fieldActions

  if (!fieldActions) {
    fieldActions = await createFieldActionWatcher(mq)

    mq.onDestroy(() => fieldActions?.destroy())
  }

  return {
    context: ctx,
    schema,
    graphqlSchema,
    server,
    fieldActions,
    db: createQueryManagerProxy(mq),
    pubSubs: mq.data.resolvedContext?.pubSubs ?? await createPubSubs(),
    jiti: mq.data.resolvedContext?.jiti ?? createJITI(mq.data.cwd, {
      requireCache: false,
      esmResolve: true,
    }),
    historyRecords: mq.data.resolvedContext?.historyRecords ?? [],
  }
}

const resolvedContextMaxAge = 2000 // 2 seconds

export async function getResolvedContext(mq: MoquerieInstance): Promise<ResolvedContext> {
  const now = Date.now()
  // If context was resolved less than 2 seconds ago, return it
  if (mq.data.watching && mq.data.resolvedContext && now - mq.data.resolvedContextTime < resolvedContextMaxAge) {
    return mq.data.resolvedContext
  }

  if (mq.data.resolvedContextPromise) {
    return mq.data.resolvedContextPromise
  }

  mq.data.resolvedContextPromise = createResolvedContext(mq)
  try {
    mq.data.resolvedContext = await mq.data.resolvedContextPromise
    mq.data.resolvedContextTime = now
    return mq.data.resolvedContext
  }
  finally {
    mq.data.resolvedContextPromise = null
  }
}
