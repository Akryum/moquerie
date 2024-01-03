import { getProjectName } from '@moquerie/core/util'

export default defineEventHandler(async () => {
  return {
    projectName: getProjectName(),
  }
})
