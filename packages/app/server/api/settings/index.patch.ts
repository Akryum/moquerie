import { getContext } from '@moquerie/core'

export default defineEventHandler(async (event) => {
  const { settings } = await readBody(event)
  const ctx = await getContext()
  await ctx.settings.updateSettings(settings)
  return ctx.settings.getSettings()
})
