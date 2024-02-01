import createJITI from 'jiti'
import path from 'pathe'
import { resolveConfig } from '@moquerie/core'

async function resolveConfigFile() {
  const mq = getMq()
  const cwd = mq.data.cwd
  const jiti = createJITI(cwd)
  return await jiti.resolve(path.resolve(cwd, 'moquerie.config'), {
    paths: [cwd],
  })
}

export async function findConfigFile() {
  const mq = getMq()
  let configFile: string | undefined
  try {
    const result = await resolveConfig(mq.data.cwd)
    configFile = result.configFile
  }
  catch (e) {
    configFile = await resolveConfigFile()
  }
  return configFile
}
