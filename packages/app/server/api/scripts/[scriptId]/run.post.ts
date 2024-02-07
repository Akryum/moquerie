import { runScript } from '@moquerie/core'

export default defineEventHandler(async (event) => {
  const { scriptId } = getRouterParams(event)

  const mq = getMq()
  const report = await runScript(mq, scriptId)
  return report
})
