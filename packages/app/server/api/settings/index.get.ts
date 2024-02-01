import { getContext } from '@moquerie/core'

export default defineEventHandler(async () => {
  const mq = getMq()
  const ctx = await mq.getContext()
  return ctx.settings.getSettings()
})
