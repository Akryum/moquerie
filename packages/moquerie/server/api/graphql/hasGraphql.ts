import { resolveConfig } from '~/lib/config.js'

export default defineEventHandler(async () => {
  const { config } = await resolveConfig()
  return !!config?.graphql
})
