import type { PubSubs } from '../pubsub/createPubSub.js'
import type { QueryManagerProxy } from '../resource/queryManagerProxy.js'

export interface Resolver {
  resourceName: string
  fieldName: string
  action: (ctx: ResolverContext) => any
  file: string
}

export interface ResolverContext {
  parent: any
  input: any
  db: QueryManagerProxy
  pubsub: PubSubs
  generateId: () => string
}

export type ResolverBaseDefinitions = Record<string, Record<string, Resolver['action']>>

/**
 * @deprecated use `Resolver` instead
 */
export type FieldAction = Resolver

/**
 * @deprecated use `ResolverContext` instead
 */
export type FieldActionContext = ResolverContext

/**
 * @deprecated use `ResolverBaseDefinitions` instead
 */
export type FieldActionBaseDefinitions = ResolverBaseDefinitions
