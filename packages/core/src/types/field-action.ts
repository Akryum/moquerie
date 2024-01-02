import type { QueryManagerProxy } from '../resource/queryManagerProxy.js'
import type { ResourceSchemaField, ResourceSchemaType } from './resource.js'

export interface FieldAction {
  resourceType: ResourceSchemaType & {
    type: 'object'
  }
  field: ResourceSchemaField
  action: (ctx: FieldActionContext) => any
  file: string
}

export interface FieldActionContext {
  parent: any
  input: any
  db: QueryManagerProxy
}

export type FieldActionBaseDefinitions = Record<string, Record<string, FieldAction['action']>>
