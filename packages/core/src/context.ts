import { FSWatcher } from 'chokidar'
import { getPort } from 'get-port-please'
import path from 'pathe'
import { debounce } from 'perfect-debounce'
import type { Config } from './types/config.js'
import { resolveConfig } from './config/resolve.js'
import { getCwd } from './util/env.js'
import type { ResourceSchema } from './types/resource.js'
import { getResourceSchema } from './resource.js'
import type { Server } from './server.js'
import { createServer } from './server.js'
import type { ResolvedGraphQLSchema } from './graphql/schema.js'
import { type QueryManagerProxy, createQueryManagerProxy } from './resource/queryManagerProxy.js'

export interface Context {
  contextWatcher: FSWatcher
  config: Config
  port: number
}

let context: Context

async function getContextRelatedToConfig() {
  const { config } = await resolveConfig()
  let port = context?.port
  if (!context || !port || context?.config.server?.port !== config?.server?.port) {
    port = await getPort({
      port: config?.server?.port ?? 5658,
    })
  }
  return {
    config: config ?? {},
    port,
  }
}

async function createContext(): Promise<Context> {
  const contextWatcher = new FSWatcher({
    ignoreInitial: true,
  })

  // Watch config file
  const cwd = getCwd()
  const configExt = ['ts', 'js', 'mjs', 'cjs', 'cts', 'mts', 'json']
  configExt.forEach((ext) => {
    contextWatcher.add(path.resolve(cwd, `moquerie.config.${ext}`))
  })

  contextWatcher.on('all', debounce(onContextChange, 100))

  return {
    contextWatcher,
    ...await getContextRelatedToConfig(),
  }
}

let contextPromise: Promise<Context>

export async function getContext(): Promise<Context> {
  if (context) {
    return context
  }

  if (contextPromise) {
    return contextPromise
  }

  contextPromise = createContext()
  context = await contextPromise
  return context
}

/**
 * Need context to be resolved first
 */
export interface ResolvedContext {
  context: Context
  schema: ResourceSchema
  graphqlSchema?: ResolvedGraphQLSchema
  server: Server
  // @TODO type
  db: QueryManagerProxy
}

let resolvedContext: ResolvedContext

async function createResolvedContext(): Promise<ResolvedContext> {
  const ctx = await getContext()

  const { schema, graphqlSchema } = await getResourceSchema(ctx)

  let server = resolvedContext?.server
  if (server) {
    if (resolvedContext.context.port !== ctx.port) {
      await server.restart()
    }
  }
  else {
    server = await createServer(ctx)
  }

  return {
    context: ctx,
    schema,
    graphqlSchema,
    server,
    db: createQueryManagerProxy(),
  }
}

let resolvedContextPromise: Promise<ResolvedContext> | null = null
let resolvedContextTime: number = 0
const resolvedContextMaxAge = 2000 // 2 seconds

export async function getResolvedContext(): Promise<ResolvedContext> {
  const now = Date.now()
  // If context was resolved less than 2 seconds ago, return it
  if (resolvedContext && now - resolvedContextTime < resolvedContextMaxAge) {
    return resolvedContext
  }

  if (resolvedContextPromise) {
    return resolvedContextPromise
  }

  resolvedContextPromise = createResolvedContext()
  resolvedContext = await resolvedContextPromise
  resolvedContextTime = now
  resolvedContextPromise = null
  return resolvedContext
}

// Context change

async function onContextChange() {
  const context = await getContext()
  Object.assign(context, await getContextRelatedToConfig())
  // Reset resolved context timer so it's re-evaluated
  resolvedContextTime = 0
}
