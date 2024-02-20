import type { MoquerieInstance } from '../instance.js'
import { getContext } from '../context.js'
import { getTypesFromFile } from './types.js'

export async function getRestResourceSchema(mq: MoquerieInstance) {
  const ctx = await getContext(mq)

  if (ctx.config.rest?.typeFiles) {
    const { types } = await getTypesFromFile(mq, ctx.config.rest.typeFiles)
    return {
      types,
    }
  }
  return {
    types: [],
  }
}
