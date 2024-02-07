import type { Faker } from '@faker-js/faker'
import type { PubSubs } from '../pubsub/createPubSub.js'
import type { QueryManagerProxy } from '../resource/queryManagerProxy.js'
import type { Awaitable } from '../util/types.js'
import type { ResourceInstanceReference } from './resource.js'

export interface ScriptContext {
  db: QueryManagerProxy
  pubsub: PubSubs
  generateId: () => string
  generateResource: (resourceName: string, factoryId: string, count?: number) => Promise<ResourceInstanceReference[]>
  faker: Faker
  repeat<T = any> (fn: () => T, min: number, max: number): Promise<Array<T>>
  pickRandom<T extends string | number | boolean = any> (list: T[]): T | null
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
