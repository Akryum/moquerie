// @ts-expect-error missing types
import launch from 'launch-editor'

export default defineEventHandler(async (event) => {
  const { file } = getQuery(event)
  launch(file)
})
