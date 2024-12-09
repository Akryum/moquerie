import fs from 'node:fs'
import { getLocalDbFolder, resourceInstancesFolders } from '@moquerie/core'
import path from 'pathe'

export default defineEventHandler(async () => {
  const folder = path.join(getLocalDbFolder(getMq()), ...resourceInstancesFolders)
  if (!fs.existsSync(folder)) {
    return []
  }
  return fs.promises.readdir(folder)
})
