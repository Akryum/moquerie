import type { RequestLike } from '@whatwg-node/server'
import type { Faker } from '@faker-js/faker'
import type { Key } from 'path-to-regexp'
import type { QueryManagerProxy } from '../resource/queryManagerProxy.js'
import type { PubSubs } from '../pubsub/createPubSub.js'
import type { Awaitable } from '../util/types.js'
import type { ResourceInstanceReference } from './resource.js'

export interface ApiRouter {
  get (path: string | RegExp, setup: ApiRouteHandlerFn): void
  post (path: string | RegExp, setup: ApiRouteHandlerFn): void
  put (path: string | RegExp, setup: ApiRouteHandlerFn): void
  patch (path: string | RegExp, setup: ApiRouteHandlerFn): void
  delete (path: string | RegExp, setup: ApiRouteHandlerFn): void
  use (path: string | RegExp, setup: ApiRouteHandlerFn): void
  middleware (setup: ApiRouteHandlerFn): void
}

export type DefineApiRouteSetupFn = (router: ApiRouter) => void

export interface ApiRouteContext {
  db: QueryManagerProxy
  pubsub: PubSubs
  generateId: () => string
  generateResource: (resourceName: string, factoryId: string, count?: number) => Promise<ResourceInstanceReference[]>
  faker: Faker
  repeat<T = any> (fn: () => T, min: number, max: number): Promise<Array<T>>
  pickRandom<T extends string | number | boolean = any> (list: T[]): T | null
  request: RequestLike
  params: Record<string, string>
  setResponseType (type: string): void
}

export type ApiRouteHandlerFn = (context: ApiRouteContext) => Awaitable<any>

export interface ApiRoute {
  path: RegExp
  method?: string
  keys?: Array<Key>
  handler: ApiRouteHandlerFn
  file: string
}
