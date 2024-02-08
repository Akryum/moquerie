import type { Hooks } from '../hooks.js'
import type { Awaitable } from '../util/types.js'

export interface Plugin extends Partial<Hooks> {
  name: string
}

export interface PluginInstance {
  plugin: Plugin
  destroyHandlers: Array<() => Awaitable<void>>
}
