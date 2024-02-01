import type { Settings } from '../types/settings.js'

const listeners: Array<(settings: Settings) => void> = []

export function onSettingsChange(listener: (settings: Settings) => void) {
  listeners.push(listener)
  return function off() {
    const index = listeners.indexOf(listener)
    if (index !== -1) {
      listeners.splice(index, 1)
    }
  }
}

export function notifySettingsChange(settings: Settings) {
  for (const listener of listeners) {
    listener(settings)
  }
}
