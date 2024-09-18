import fs from 'node:fs'
import path from 'pathe'
import { getLocalFolder } from '../storage/path.js'
import { ensureDir } from '../util/fs.js'
import type { Settings } from '../types/settings.js'
import type { MoquerieInstance } from '../instance.js'
import { notifySettingsChange } from './onChange.js'

export interface SettingsManager {
  getSettings: () => Promise<Settings>
  updateSettings: (settings: Partial<Settings>) => Promise<void>
}

export async function createSettingsManager(mq: MoquerieInstance) {
  const file = path.join(getLocalFolder(mq), 'settings.json')
  await ensureDir(path.dirname(file))

  let currentSettings: Settings

  if (fs.existsSync(file)) {
    try {
      const content = await fs.promises.readFile(file, 'utf8')
      currentSettings = JSON.parse(content)
    }
    catch (e) {
      console.error(e)
      currentSettings = {}
    }
  }
  else {
    currentSettings = {}
  }

  async function getSettings() {
    return currentSettings
  }

  async function updateSettings(settings: Partial<Settings>) {
    currentSettings = {
      ...currentSettings,
      ...settings,
    }

    notifySettingsChange(currentSettings)

    if (!mq.data.skipWrites) {
      try {
        await fs.promises.writeFile(file, JSON.stringify(currentSettings, null, 2))
      }
      catch (e) {
        console.error(e)
      }
    }
  }

  notifySettingsChange(currentSettings)

  return {
    getSettings,
    updateSettings,
  }
}
