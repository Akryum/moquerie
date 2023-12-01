import createJITI from 'jiti'
import path from 'pathe'
import { resolveConfig } from '~/lib/config.js'
import { getCwd } from '~/lib/env.js'

async function resolveConfigFile() {
  const jiti = createJITI(getCwd())
  return await jiti.resolve(path.resolve(getCwd(), 'moquerie.config'), {
    paths: [getCwd()],
  })
}

export async function findConfigFile() {
  let configFile: string | undefined
  try {
    const result = await resolveConfig()
    configFile = result.configFile
  }
  catch (e) {
    configFile = await resolveConfigFile()
  }
  return configFile
}
