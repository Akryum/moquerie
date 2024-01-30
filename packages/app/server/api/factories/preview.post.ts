import { createInstanceFromFactory, getCurrentUser, getResolvedContext, serializeFactory } from '@moquerie/core'
import { printCode } from '@moquerie/core/util'
import type { FactoryData } from '@/components/factory/formTypes.js'

export default defineEventHandler<{ body: FactoryData }>(async (event) => {
  const ctx = await getResolvedContext()
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

  const instance = await createInstanceFromFactory({
    factory,
    inlineCode,
    save: false,
  })
  return instance.value
})
