import type { PubSubs } from '../pubsub/createPubSub.js'
import type { QueryManagerProxy } from '../resource/queryManagerProxy.js'

export interface FieldAction {
  resourceName: string
  fieldName: string
  action: (ctx: FieldActionContext) => any
  file: string
}

export interface FieldActionContext {
  parent: any
  input: any
  db: QueryManagerProxy
  pubsub: PubSubs
  generateId: () => string
}

export type FieldActionBaseDefinitions = Record<string, Record<string, FieldAction['action']>>
