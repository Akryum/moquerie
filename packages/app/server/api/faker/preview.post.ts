import SuperJSON from 'superjson'
import { generateValueFromFaker, getFaker } from '@moquerie/core'

interface Body {
  factory: string
  locale?: string
  paramsCode?: string
  paramsContext?: string
}

export default defineEventHandler<{ body: Body }>(async (event) => {
  const body = await readBody(event)
  let paramsContext = body.paramsContext ? SuperJSON.parse<any>(body.paramsContext) ?? JSON.parse(body.paramsContext) : undefined
  if (!paramsContext) {
    paramsContext = {}
  }
  if (!paramsContext.item) {
    paramsContext.item = {}
  }
  const faker = await getFaker({
    locale: body.locale,
    seed: undefined,
  })
  try {
    return generateValueFromFaker({
      factory: body.factory,
      faker,
      paramsCode: body.paramsCode,
      paramsContext,
    })
  }
  catch (error) {
    return generateValueFromFaker({
      factory: body.factory,
      faker,
    })
  }
})
