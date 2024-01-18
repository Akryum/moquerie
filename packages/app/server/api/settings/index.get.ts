import { getContext } from '@moquerie/core'

export default defineEventHandler(async () => {
  const ctx = await getContext()
  return ctx.settings.getSettings()
})
