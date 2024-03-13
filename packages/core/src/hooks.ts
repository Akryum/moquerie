import type { ResourceSchema } from './types/resource.js'
import { createHooks } from './util/hookable.js'
import type { Awaitable } from './util/types.js'

export interface HookWriteCodeContext {
  path: string
  code: string
  type: 'factory' | 'types'
}

export interface HookTransformSchemaContext {
  schema: ResourceSchema
}

export interface HookBeforeSendResponseContext {
  response: any
  type: 'rest' | 'graphql'
  request?: Request
  params?: Record<string, string>
  generatedResolver?: boolean
  resourceName?: string
}

export interface HookResolveResourceFromRequestContext {
  path: string
  request: Request
  schema: ResourceSchema
}

export interface Hooks {
  writeCode: (context: HookWriteCodeContext) => Awaitable<string | void>
  transformSchema: (context: HookTransformSchemaContext) => Awaitable<void>
  beforeSendResponse: (context: HookBeforeSendResponseContext) => Awaitable<any | void>
  resolveResourceFromRequest: (context: HookResolveResourceFromRequestContext) => Awaitable<string | void>
}

export const hooks = createHooks<Hooks>()
