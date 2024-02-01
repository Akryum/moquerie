import { resolveConfig } from '@moquerie/core'

export default defineEventHandler(() => resolveConfig(getMq().data.cwd))
