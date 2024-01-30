import { nanoid } from 'nanoid'
import path from 'pathe'
import { getCurrentUser, getFactoryFilename, getFactoryStorage } from '@moquerie/core'
import type { ResourceFactory } from '@moquerie/core'
import type { FactoryData } from '~/components/factory/formTypes.js'

export default defineEventHandler(async (event) => {
  const body: FactoryData = await readBody(event)
  const storage = await getFactoryStorage()
  const id = `${body.resourceName}-${body.name}${body.location === 'local' ? `@@${nanoid()}` : ''}`

  if (await storage.findById(id)) {
    throw new Error(`Factory with id "${id}" already exists`)
  }

  const file = path.join(storage[body.location].folder, getFactoryFilename(body.resourceName, id, body.name, body.location))

  const factory: ResourceFactory = {
    ...body,
    id,
    file,
    lastUsedAt: null,
    info: {
      ...body.info,
      createdAt: new Date(),
      author: await getCurrentUser(),
    },
  }
  await storage.save(factory, factory.location)
  return factory
})
