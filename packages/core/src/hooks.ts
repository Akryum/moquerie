import type { ResourceSchema } from './types/resource.js'
import { createHooks } from './util/hookable.js'
import type { Awaitable } from './util/types.js'

export interface Hooks {
  saveFactory: (context: { path: string, content: string }) => Awaitable<string | void>
  transformSchema: (context: { schema: ResourceSchema }) => Awaitable<void>
}

export const hooks = createHooks<Hooks>()
