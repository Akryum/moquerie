import type { MoquerieInstance } from '../instance.js'
import { getContext } from '../context.js'
import { getTypesFromFile } from '../resource/fromTypes.js'
import type { ResourceSchemaType } from '../types/resource.js'

export async function getRestResourceSchema(mq: MoquerieInstance) {
  const ctx = await getContext(mq)

  if (ctx.config.rest?.typeFiles) {
    const { types } = await getTypesFromFile(mq, ctx.config.rest.typeFiles, ['rest'])

    const finalTypes: Array<ResourceSchemaType> = []

    for (const key in types) {
      const type = types[key]

      // Inline
      let inline = true
      if (Object.keys(type.fields).some(field => ['id', '_id'].includes(field))) {
        inline = false
      }

      finalTypes.push({
        ...type,
        inline,
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
