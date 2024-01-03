import type { Settings } from '../types/settings.js'

const listeners: Array<(settings: Settings) => void> = []

export function onSettingsChange(listener: (settings: Settings) => void) {
  listeners.push(listener)
}

export function notifySettingsChange(settings: Settings) {
  for (const listener of listeners) {
    listener(settings)
  }
}
