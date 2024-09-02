import type { Faker } from '@faker-js/faker'
import type { PubSubs } from '../pubsub/createPubSub.js'
import type { QueryManagerProxy } from '../resource/queryManagerProxy.js'
import type { Awaitable } from '../util/types.js'
import type { ResourceInstanceReference } from './resource.js'

export interface ScriptContext {
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
}

export type ScriptFn = (context: ScriptContext) => Awaitable<void>

export interface ScriptItem {
  id: string
  description?: string
  file: string
  fn: ScriptFn
}

export interface ScriptLogItem {
  type: keyof ScriptContext
  label: string
  time: number
  data?: any
}

export interface ScriptRunReport {
  id: string
  logs: ScriptLogItem[]
  error?: Error
  startTime: number
  endTime: number
}
