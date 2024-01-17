import { getResolvedContext, getResourceInstanceStorage } from '@moquerie/core'

export default defineEventHandler(async () => {
  const ctx = await getResolvedContext()
  const ids: Record<string, string[]> = {}
  for (const resourceName in ctx.schema.types) {
    const storage = await getResourceInstanceStorage(resourceName)
    ids[resourceName] = Object.keys(storage.manifest.files)
  }
  return ids
})
