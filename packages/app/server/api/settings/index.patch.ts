import { getContext } from '@moquerie/core'

export default defineEventHandler(async (event) => {
  const mq = getMq()
  const { settings } = await readBody(event)
  const ctx = await mq.getContext()
  await ctx.settings.updateSettings(settings)
  return ctx.settings.getSettings()
})
