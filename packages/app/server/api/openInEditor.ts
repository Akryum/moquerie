import { getCwd } from '@moquerie/core/util'

// @ts-expect-error missing types
import launch from 'launch-editor'
import path from 'pathe'

export default defineEventHandler(async (event) => {
  const { file } = getQuery(event)
  launch(path.resolve(getCwd(), String(file)))
})
