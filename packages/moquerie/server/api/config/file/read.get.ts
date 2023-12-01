import fs from 'node:fs/promises'
import { resolveConfig } from '~/lib/config.js'

export default defineEventHandler(async () => {
  const configFile = await findConfigFile()
  if (configFile) {
    return {
      file: configFile,
      content: await fs.readFile(configFile, 'utf-8'),
    }
  }
  throw new Error('config not found')
})
