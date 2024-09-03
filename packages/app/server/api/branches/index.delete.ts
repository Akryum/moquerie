import { deleteBranch } from '@moquerie/core'

export default defineEventHandler(async (event) => {
  const { branch } = await readBody(event)
  const mq = getMq()
  await deleteBranch(mq, branch)
})
