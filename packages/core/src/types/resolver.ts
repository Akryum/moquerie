import type { PubSubs } from '../pubsub/createPubSub.js'
import type { QueryManagerProxy } from '../resource/queryManagerProxy.js'

export interface Resolver {
  resourceName: string
  fieldName: string
  action: (ctx: ResolverContext) => any
  file: string
}

export interface ResolverContext {
  /**
   * The parent object. For example, if the resolver is for a field `user` on a `Post` type, then `parent` will be the `Post` object.
   */
  parent: any
  /**
   * The input object. This is the object that was passed to the resolver as part of the field parameters.
   *
   * For example, if the resolver is for a field `user` on a `Post` type, then `input` will be the parameters object that was passed to the `user` field.
   */
  input: any
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
