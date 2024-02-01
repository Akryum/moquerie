// @ts-expect-error missing types
import launch from 'launch-editor'
import path from 'pathe'

export default defineEventHandler(async (event) => {
  const mq = getMq()
  const { file } = getQuery(event)
  launch(path.resolve(mq.data.cwd, String(file)))
})
