import { nanoid } from 'nanoid'
import type { ResourceFactory, ResourceFactoryContext, ResourceFactoryFn } from '../types/factory.js'
import type { Awaitable } from '../util/types.js'
import { createResourceInstanceReference } from '../resource/resourceReference.js'
import { isPlainObject } from '../util/object.js'
import type { MoquerieInstance } from '../instance.js'
import { pickRandom, repeat } from '../util/random.js'
import { getFaker } from './fakerGet.js'

/**
 * Create new instance data.
 * @returns New instance data that can be used to create a new resource instance.
 */
export async function executeFactory(mq: MoquerieInstance, factory: ResourceFactory, fn: ResourceFactoryFn, instanceId: string) {
  const ctx = await mq.getResolvedContext()

  const rootRef = createResourceInstanceReference(factory.resourceName, instanceId)

  const result: Record<string, any> = {}

  const factoryContext: ResourceFactoryContext = {
    faker: await getFaker(mq, {
      locale: factory.info.fakerLocale,
      seed: factory.info.fakerSeed,
    }),
    db: ctx.db,
    repeat: repeat.bind(null, result) as (fn: (item: any) => any, min: number, max: number) => Promise<any[]>,
    pickRandom,
    generateId: nanoid,
  }

  const rawResult = fn(factoryContext)
  const tasks: Array<() => Awaitable<any>> = []

  function processField(target: any, key: any, value: any) {
    if (Array.isArray(value)) {
      const list = target[key] = []
      for (const i in value) {
        const item = value[i]
        tasks.unshift(() => {
          processField(list, i, item)
        })
      }
    }
    else if (typeof value?.then === 'function') {
      tasks.unshift(async () => {
        const resultValue = await value
        processField(target, key, resultValue)
      })
    }
    else if (typeof value === 'function') {
      tasks.push(async () => {
        const resultValue = await value({ item: target, rootRef })
        processField(target, key, resultValue)
      })
    }
    else if (value && isPlainObject(value)) {
      target[key] = value
      for (const k in value) {
        const v = value[k]
        processField(value, k, v)
      }
    }
    else {
      target[key] = value
    }
  }

  for (const key in rawResult) {
    const value = rawResult[key]
    processField(result, key, value)
  }

  while (tasks.length > 0) {
    const task = tasks.shift()!
    await task()
  }

  return result
}
