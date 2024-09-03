import { renameBranch } from '@moquerie/core'

export default defineEventHandler(async (event) => {
  const { branch, newName } = await readBody(event)
  const mq = getMq()
  await renameBranch(mq, branch, newName)
})
