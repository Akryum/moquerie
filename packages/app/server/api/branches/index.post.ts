import { createBranch } from '@moquerie/core'

export default defineEventHandler(async (event) => {
  const { name, empty } = await readBody(event)

  await createBranch(getMq(), { name, empty })

  return name
})
