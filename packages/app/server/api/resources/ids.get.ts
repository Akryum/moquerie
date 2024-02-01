import { getResolvedContext, getResourceInstanceStorage } from '@moquerie/core'

export default defineEventHandler(async () => {
  const mq = getMq()
  const ctx = await mq.getResolvedContext()
  const ids: Record<string, string[]> = {}
  for (const resourceName in ctx.schema.types) {
    const storage = await getResourceInstanceStorage(mq, resourceName)
    ids[resourceName] = Object.keys(storage.manifest.files)
  }
  return ids
})
