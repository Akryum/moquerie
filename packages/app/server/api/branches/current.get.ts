import { getCurrentBranch } from '@moquerie/core'

export default defineEventHandler(() => getCurrentBranch(getMq()))
