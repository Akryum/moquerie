import { getResolvedContext } from '@moquerie/core'

export default defineNitroPlugin(async () => {
  // Start server
  await getResolvedContext()
})
