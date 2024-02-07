import { nanoid } from 'nanoid'
import { getFaker } from '../factory/fakerGet.js'
import type { MoquerieInstance } from '../instance.js'
import type { ScriptContext, ScriptRunReport } from '../types/script.js'
import { pickRandom, repeat } from '../util/random.js'
import { getFactoryStorage } from '../factory/storage.js'
import { generateResourceInstances } from '../resource/generateInstances.js'
import { createResourceInstanceReference } from '../resource/resourceReference.js'
import { createSpyProxy } from '../util/object.js'

export async function runScript(mq: MoquerieInstance, scriptId: string) {
  const ctx = await mq.getResolvedContext()
  const script = ctx.scripts.items.find(item => item.id === scriptId)
  if (!script) {
    throw new Error(`Script not found: ${scriptId}`)
  }

  const report: ScriptRunReport = {
    id: nanoid(),
    logs: [],
    startTime: Date.now(),
    endTime: 0,
  }

  const proxiedDb = createSpyProxy(ctx.db, 2, (path, params) => {
    report.logs.push({
      type: 'db',
      label: `${path.join('.')}`,
      time: Date.now(),
      data: {
        params,
      },
    })
  })

  const proxiedPubsub = createSpyProxy(ctx.pubSubs, 2, (path, params) => {
    report.logs.push({
      type: 'pubsub',
      label: `${path.join('.')}`,
      time: Date.now(),
      data: {
        params,
      },
    })
  })

  const proxiedFaker = createSpyProxy(await getFaker(mq), 2, (path, params) => {
    report.logs.push({
      type: 'faker',
      label: `${path.join('.')}`,
      time: Date.now(),
      data: {
        params,
      },
    })
  })

  const context: ScriptContext = {
    db: proxiedDb,
    pubsub: proxiedPubsub,
    faker: proxiedFaker,
    generateId: () => {
      const id = nanoid()
      report.logs.push({
        type: 'generateId',
        label: id,
        time: Date.now(),
      })
      return id
    },
    generateResource: async (resourceName, factoryId, count = 1) => {
      const resourceType = ctx.schema.types[resourceName]
      if (!resourceType) {
        throw new Error(`Resource type not found: ${resourceName}`)
      }
      const factory = await (await getFactoryStorage(mq)).findById(`${resourceName}-${factoryId}`)
      if (!factory) {
        throw new Error(`Factory not found: ${factoryId}`)
      }
      if (factory.resourceName !== resourceName) {
        throw new Error(`Factory resource type mismatch: ${factory.resourceName} !== ${resourceName}`)
      }
      const instances = await generateResourceInstances(mq, {
        resourceType,
        factory,
        count,
      })
      const refs = instances.map(i => createResourceInstanceReference(i.resourceName, i.id))
      report.logs.push({
        type: 'generateResource',
        label: factoryId,
        time: Date.now(),
        data: {
          resourceName,
          factoryId,
          count,
          refs,
        },
      })
      return refs
    },
    repeat: (fn, min, max) => {
      report.logs.push({
        type: 'repeat',
        label: `(${min}-${max})`,
        time: Date.now(),
        data: {
          min,
          max,
          fn: fn.toString(),
        },
      })
      return repeat({}, fn, min, max)
    },
    pickRandom: (list) => {
      const value = pickRandom(list)
      report.logs.push({
        type: 'pickRandom',
        label: value,
        time: Date.now(),
        data: {
          list,
          value,
        },
      })
      return value
    },
  }

  try {
    await script.fn(context)
  }
  catch (e: any) {
    report.error = {
      name: e.name,
      message: e.message,
      stack: e.stack,
    }
    console.error(e)
  }
  report.endTime = Date.now()

  // Serialize function params
  for (const log of report.logs) {
    if (log.data?.params) {
      for (const key in log.data.params) {
        console.log(key, log.data.params[key])
        if (typeof log.data.params[key] === 'function') {
          log.data.params[key] = { __fn: log.data.params[key].toString() }
        }
      }
      console.log(log.data.params)
    }
  }

  return report
}
