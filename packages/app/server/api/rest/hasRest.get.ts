import { resolveConfig } from '@moquerie/core'

export default defineEventHandler(async () => {
  const mq = getMq()
  const { config } = await resolveConfig(mq.data.cwd)
  return !!config?.rest
})
