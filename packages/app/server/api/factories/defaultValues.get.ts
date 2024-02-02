import type { ResourceFactory } from '@moquerie/core'
import { createDefaultFactoryFields, createInstanceFromFactory, getCurrentUser, serializeFactory } from '@moquerie/core'
import { printCode } from '@moquerie/core/util'

export default defineEventHandler<{ query: { resourceName: string } }>(async (event) => {
  const { resourceName } = getQuery(event)
  const mq = getMq()
  const ctx = await mq.getResolvedContext()
  const resourceType = ctx.schema.types[resourceName]
  if (!resourceType) {
    throw new Error(`Resource ${resourceName} not found`)
  }
  const defaultFields = await createDefaultFactoryFields(mq, {
    resourceType,
    randomRefs: false,
  })
  const factory: ResourceFactory = {
    id: 'default-preview',
    name: 'default preview',
    file: '',
    resourceName,
    location: 'local',
    lastUsedAt: null,
    info: {
      createdAt: new Date(),
      applyTags: [],
      createPrompts: [],
      tags: [],
      author: await getCurrentUser(),
    },
    fields: defaultFields,
  }

  const ast = await serializeFactory(factory)
  ast.program.body = ast.program.body.filter(node => node.type !== 'ImportDeclaration')
  const inlineCode = printCode(ast)

  const instance = await createInstanceFromFactory(mq, {
    factory,
    inlineCode,
    save: false,
  })
  return instance.value
})
