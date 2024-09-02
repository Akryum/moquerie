import type { RequestLike } from '@whatwg-node/server'
import type { Faker } from '@faker-js/faker'
import type { Key } from 'path-to-regexp'
import type { QueryManagerProxy } from '../resource/queryManagerProxy.js'
import type { PubSubs } from '../pubsub/createPubSub.js'
import type { Awaitable } from '../util/types.js'
import type { ResourceInstanceReference } from './resource.js'

export interface ApiRouter {
  get: (path: string | RegExp, setup: ApiRouteHandlerFn) => void
  post: (path: string | RegExp, setup: ApiRouteHandlerFn) => void
  put: (path: string | RegExp, setup: ApiRouteHandlerFn) => void
  patch: (path: string | RegExp, setup: ApiRouteHandlerFn) => void
  delete: (path: string | RegExp, setup: ApiRouteHandlerFn) => void
  use: (path: string | RegExp, setup: ApiRouteHandlerFn) => void
  middleware: (setup: ApiRouteHandlerFn) => void
}

export type DefineApiRouteSetupFn = (router: ApiRouter) => void

export interface ApiRouteContext {
  /**
   * The database query manager.
   */
  db: QueryManagerProxy
  /**
   * The pubsub instance to send real-time updates.
   */
  pubsub: PubSubs
  /**
   * Generate a random id.
   */
  generateId: () => string
  /**
   * Generate one or more resource instances using a factory.
   */
  generateResource: (resourceName: string, factoryId: string, count?: number) => Promise<ResourceInstanceReference[]>
  /**
   * The faker instance.
   */
  faker: Faker
  /**
   * Repeat a function multiple times.
   */
  repeat: <T = any>(fn: () => T, min: number, max: number) => Promise<Array<T>>
  /**
   * Pick a random item from a list.
   */
  pickRandom: <T extends string | number | boolean = any>(list: T[]) => T | null
  /**
   * The current request.
   */
  request: RequestLike
  /**
   * The path parameters.
   *
   * Example:
   *
   * For the route `/users/:id`, if the URL is `/users/123`, then `params` will be `{ id: '123' }`.
   */
  params: Record<string, string>
  /**
   * The query parameters.
   *
   * Example:
   *
   * For the URL `/users?name=John`, then `query` will be `{ name: 'John' }`.
   */
  query: Record<string, string>
  /**
   * Read the request body.
   */
  readBody: () => Promise<any>
  /**
   * Set the response type.
   */
  setResponseType: (type: string) => void
  /**
   * Create an HTTP error.
   */
  createError: (message: string, data?: any) => Error
}

export type ApiRouteHandlerFn = (context: ApiRouteContext) => Awaitable<any>

export interface ApiRoute {
  path: RegExp
  method?: string
  keys?: Array<Key>
  handler: ApiRouteHandlerFn
  file: string
}
