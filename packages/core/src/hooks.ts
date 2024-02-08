import { createHooks } from './util/hookable.js'
import type { Awaitable } from './util/types.js'

export interface Hooks {
  saveFactory: (context: { path: string, content: string }) => Awaitable<string | void>
}

export const hooks = createHooks<Hooks>()
