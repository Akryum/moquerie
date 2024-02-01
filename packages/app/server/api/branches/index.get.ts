import fs from 'node:fs'
import path from 'pathe'
import { getLocalDbFolder, resourceInstancesFolders } from '@moquerie/core'

export default defineEventHandler(async () => {
  const folder = path.join(getLocalDbFolder(getMq()), ...resourceInstancesFolders)
  return fs.promises.readdir(folder)
})
