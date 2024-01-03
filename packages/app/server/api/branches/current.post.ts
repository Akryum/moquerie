import { switchToBranch } from '@moquerie/core'

export default defineEventHandler(async (event) => {
  const { branch } = await readBody(event)
  await switchToBranch(branch)
  return branch
})
