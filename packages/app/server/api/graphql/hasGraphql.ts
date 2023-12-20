import { resolveConfig } from '@moquerie/core'

export default defineEventHandler(async () => {
  const { config } = await resolveConfig()
  return !!config?.graphql
})
