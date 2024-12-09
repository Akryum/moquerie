import type { MoquerieInstance } from '../instance.js'
import type { ResourceSchemaType } from '../types/resource.js'
import { getContext } from '../context.js'
import { getTypesFromFile } from '../resource/fromTypes.js'

export async function getRestResourceSchema(mq: MoquerieInstance) {
  const ctx = await getContext(mq)

  if (ctx.config.rest?.typeFiles) {
    const { types } = await getTypesFromFile(mq, ctx.config.rest.typeFiles, ['rest'])

    const finalTypes: Array<ResourceSchemaType> = []

    for (const key in types) {
      const type = types[key]
      finalTypes.push({
        ...type,
        inline: !Object.keys(type.fields).some(field => ['id', '_id'].includes(field)),
        nonNull: false,
        array: true,
      })
    }

    return {
      types,
    }
  }
  return {
    types: [],
  }
}
