import type { FactoryData } from '@/components/factory/formTypes.js'
import { createInstanceFromFactory, getCurrentUser, serializeFactory } from '@moquerie/core'
import { printCode } from '@moquerie/core/util'

export default defineEventHandler<{ body: FactoryData }>(async (event) => {
  const mq = getMq()
  const ctx = await mq.getResolvedContext()
  const factoryData = await readBody(event)
  const resourceType = ctx.schema.types[factoryData.resourceName]
  if (!resourceType) {
    throw new Error(`Resource type ${factoryData.resourceName} not found`)
  }

  const factory = {
    ...factoryData,
    id: 'preview-factory',
    file: 'default',
    info: {
      ...factoryData.info,
      createdAt: new Date(),
      author: await getCurrentUser(),
      fakerSeed: undefined,
    },
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
