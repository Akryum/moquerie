import type { JITI } from 'jiti'
import type { ResolvedGraphQLSchema } from './graphql/schema.js'
import type { MoquerieInstance } from './instance.js'
import type { Server } from './server.js'
import type { Config } from './types/config.js'
import type { HistoryRecord } from './types/history.js'
import type { Plugin, PluginInstance } from './types/plugin.js'
import type { ResourceSchema } from './types/resource.js'
import { FSWatcher } from 'chokidar'
import { getPort } from 'get-port-please'
import createJITI from 'jiti'
import path from 'pathe'
import { debounce } from 'perfect-debounce'
import { resolveConfig } from './config/resolve.js'
import { type Hooks, hooks } from './hooks.js'
import { MockFileWatcher } from './mock/index.js'
import { createPubSubs, type PubSubs } from './pubsub/createPubSub.js'
import { FieldActionStore, ResolverStore } from './resolvers/index.js'
import { getResourceSchema } from './resource.js'
import { createQueryManagerProxy, type QueryManagerProxy } from './resource/queryManagerProxy.js'
import { SchemaTransformStore } from './resource/schemaTransformStore.js'
import { ApiRouteStore } from './rest/apiRouteStore.js'
import { ScriptStore } from './script/scriptStore.js'
import { createServer } from './server.js'
import { createSettingsManager, type SettingsManager } from './settings/settingsManager.js'
import { generateTsTypes } from './tsCodegen/genTypes.js'

export interface Context {
  contextWatcher: FSWatcher
  config: Config
  settings: SettingsManager
  port: number
  plugins: Array<PluginInstance>
}

async function getContextRelatedToConfig(mq: MoquerieInstance) {
  const { config } = await resolveConfig(mq.data.cwd)
  let port = mq.data.context?.port
  if (!mq.data.context || !port || mq.data.context?.config.server?.port !== config?.server?.port) {
    port = await getPort({
      port: config?.server?.port ?? 5658,
    })
  }

  // Plugins
  // Clean up previous plugins
  const previousPlugins = mq.data.context?.plugins ?? []
  for (const plugin of previousPlugins) {
    for (const destroyHandler of plugin.destroyHandlers) {
      await destroyHandler()
    }
  }
  // Register new plugins hooks
  const plugins = config?.plugins ?? []
  const pluginInstances: PluginInstance[] = []
  for (const option of plugins) {
    const plugin = await option
    const instance: PluginInstance = {
      plugin,
      destroyHandlers: [],
    }
    for (const key in plugin) {
      if (key !== 'name') {
        const value = plugin[key as keyof Plugin]
        instance.destroyHandlers.push(hooks.hook(key as keyof Hooks, value as any))
      }
    }
    pluginInstances.push(instance)
  }

  return {
    config: config ?? {},
    port,
    plugins: pluginInstances,
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
  mockFiles: MockFileWatcher
  /**
   * @deprecated use `resolvers` instead
   */
  fieldActions: FieldActionStore
  resolvers: ResolverStore
  schemaTransforms: SchemaTransformStore
  scripts: ScriptStore
  apiRoutes: ApiRouteStore
  // @TODO type
  db: QueryManagerProxy
  // @TODO type
  pubSubs: PubSubs
  jiti: JITI
  historyRecords: Array<HistoryRecord>
}

async function createResolvedContext(mq: MoquerieInstance): Promise<ResolvedContext> {
  const ctx = await mq.getContext()

  // Mock files

  // Cache for tests
  const mockFileCache: Record<string, MockFileWatcher> | null = mq.data.watching
    ? null
    : (globalThis as any).__mqMockFileCache = (globalThis as any).__mqMockFileCache ?? {}

  let mockFileWatcher = mq.data.resolvedContext?.mockFiles ?? mockFileCache?.[mq.data.cwd]
  const isMockFileWatcherNew = !mockFileWatcher

  if (!mockFileWatcher) {
    mockFileWatcher = new MockFileWatcher(mq)
    mq.onDestroy(() => mockFileWatcher?.destroy())

    if (mockFileCache) {
      mockFileCache[mq.data.cwd] = mockFileWatcher
    }
  }

  // Field actions

  let fieldActions = mq.data.resolvedContext?.fieldActions

  if (!fieldActions) {
    fieldActions = new FieldActionStore()
    mockFileWatcher.onUpdate(fieldActions.handleMockFile.bind(fieldActions))
    mockFileWatcher.onRemove(fieldActions.handleMockFileRemoved.bind(fieldActions))
    mq.onDestroy(() => fieldActions?.destroy())
  }

  // Resolvers

  let resolvers = mq.data.resolvedContext?.resolvers

  if (!resolvers) {
    resolvers = new ResolverStore()
    mockFileWatcher.onUpdate(resolvers.handleMockFile.bind(resolvers))
    mockFileWatcher.onRemove(resolvers.handleMockFileRemoved.bind(resolvers))
    mq.onDestroy(() => resolvers?.destroy())
  }

  // Schema transforms

  let schemaTransforms = mq.data.resolvedContext?.schemaTransforms

  if (!schemaTransforms) {
    schemaTransforms = new SchemaTransformStore()
    mockFileWatcher.onUpdate(schemaTransforms.handleMockFile.bind(schemaTransforms))
    mockFileWatcher.onRemove(schemaTransforms.handleMockFileRemoved.bind(schemaTransforms))
    mq.onDestroy(() => schemaTransforms?.destroy())

    // Update schema
    schemaTransforms.onChange(async () => {
      if (mq.data.resolvedContext && schemaTransforms) {
        const { schema } = await getResourceSchema(mq, schemaTransforms)
        mq.data.resolvedContext.schema = schema
      }
    })
  }

  // Scripts

  let scripts = mq.data.resolvedContext?.scripts

  if (!scripts) {
    scripts = new ScriptStore()
    mockFileWatcher.onUpdate(scripts.handleMockFile.bind(scripts))
    mockFileWatcher.onRemove(scripts.handleMockFileRemoved.bind(scripts))
    mq.onDestroy(() => scripts?.destroy())
  }

  // Api Routes

  let apiRoutes = mq.data.resolvedContext?.apiRoutes

  if (!apiRoutes) {
    apiRoutes = new ApiRouteStore()
    mockFileWatcher.onUpdate(apiRoutes.handleMockFile.bind(apiRoutes))
    mockFileWatcher.onRemove(apiRoutes.handleMockFileRemoved.bind(apiRoutes))
    mq.onDestroy(() => apiRoutes?.destroy())
  }

  // Wait for mock files to be ready

  if (isMockFileWatcherNew) {
    await mockFileWatcher.init()
  }

  // Schema

  // Cache for tests
  const schemaCache: Record<string, Awaited<ReturnType<typeof getResourceSchema>>> | null = mq.data.watching
    ? null
    : (globalThis as any).__mqSchemaCache = (globalThis as any).__mqSchemaCache ?? {}

  let schema = mq.data.resolvedContext?.schema ?? schemaCache?.[mq.data.cwd]?.schema
  let graphqlSchema = mq.data.resolvedContext?.graphqlSchema ?? schemaCache?.[mq.data.cwd]?.graphqlSchema

  if (!schema || mq.data.watching) {
    const result = await getResourceSchema(mq, schemaTransforms)
    schema = result.schema
    graphqlSchema = result.graphqlSchema

    if (schemaCache) {
      schemaCache[mq.data.cwd] = {
        schema,
        graphqlSchema,
      }
    }
  }

  // Generate types
  if (mq.data.watching) {
    await generateTsTypes(mq, schema)
  }

  // API Server

  let server = mq.data.resolvedContext?.server
  if (server) {
    if (mq.data.resolvedContext?.context.port !== ctx.port) {
      await server.restart()
    }
  }
  else {
    const s = server = await createServer(mq)
    mq.onDestroy(() => s.close())
  }

  // Create context object

  const db = createQueryManagerProxy(mq)
  const pubSubs = mq.data.resolvedContext?.pubSubs ?? await createPubSubs()
  const jiti = mq.data.resolvedContext?.jiti ?? createJITI(mq.data.cwd, {
    requireCache: false,
    esmResolve: true,
  })

  return {
    context: ctx,
    schema,
    graphqlSchema,
    server,
    mockFiles: mockFileWatcher,
    fieldActions,
    resolvers,
    schemaTransforms,
    scripts,
    apiRoutes,
    db,
    pubSubs,
    jiti,
    historyRecords: mq.data.resolvedContext?.historyRecords ?? [],
  }
}

const resolvedContextMaxAge = 2000 // 2 seconds

export async function getResolvedContext(mq: MoquerieInstance): Promise<ResolvedContext> {
  const now = Date.now()
  // If context was resolved less than 2 seconds ago, return it
  if (mq.data.resolvedContext && now - mq.data.resolvedContextTime < resolvedContextMaxAge) {
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

export async function startServer(mq: MoquerieInstance) {
  const ctx = await mq.getResolvedContext()
  return {
    ...ctx,
    port: ctx.context.port,
  }
}
