import { createMoquerieInstance } from '@moquerie/core'
import { getDefaultCwd } from '@moquerie/core/util'
import { setMq } from '../utils/instance.js'

export default defineNitroPlugin(async () => {
  const mq = await createMoquerieInstance({
    cwd: getDefaultCwd(),
  })
  setMq(mq)
  // Start server
  await mq.getResolvedContext()
})
