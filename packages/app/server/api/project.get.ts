import { getProjectName } from '@moquerie/core/util'

export default defineEventHandler(async () => {
  const mq = getMq()
  return {
    projectName: getProjectName(mq),
  }
})
