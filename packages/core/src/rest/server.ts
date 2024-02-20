import { Buffer } from 'node:buffer'
import type { Application } from 'express'
import { camelCase, kebabCase, pascalCase, snakeCase } from 'scule'
import { normalizeNodeRequest } from '@whatwg-node/server'
import { nanoid } from 'nanoid'
import type { MoquerieInstance } from '../instance.js'
import type { ResourceSchemaType } from '../types/resource.js'
import { getFaker } from '../factory/fakerGet.js'
import { pickRandom, repeat } from '../util/random.js'
import { getFactoryStorage } from '../factory/storage.js'
import { generateResourceInstances } from '../resource/generateInstances.js'
import { createResourceInstanceReference } from '../resource/resourceReference.js'
import { isPlainObject } from '../util/object.js'

export async function setupRestApi(mq: MoquerieInstance, expressApp: Application) {
  expressApp.use(mq.data.context?.config.rest?.basePath ?? '/rest', async (req, res) => {
    try {
      const route = req.path.split('/')
      const routeType = route[1]

      const ctx = await mq.getResolvedContext()

      // Custom Api Routes
      for (const route of ctx.apiRoutes.items) {
        const result = route.path.exec(req.path)
        if (result) {
          if (route.method && route.method !== req.method) {
            continue
          }

          const params: Record<string, string> = {}
          for (let i = 1; i < result.length; i++) {
            params[route.keys?.[i - 1]?.name ?? `unknown${i}`] = result[i]
          }
          const request = normalizeNodeRequest(req, Request)
          let type: string | undefined
          const time = Date.now()
          const data = await route.handler({
            request,
            params,
            db: ctx.db,
            pubsub: ctx.pubSubs,
            faker: await getFaker(mq),
            generateId: () => nanoid(),
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
              return refs
            },
            repeat: (fn, min, max) => repeat({}, fn, min, max),
            pickRandom,
            setResponseType: (t) => {
              type = t
            },
          })
          // eslint-disable-next-line no-console
          console.log(`[ApiRoute] ${req.method} ${req.path} handler ${Date.now() - time}ms`)
          if (data !== undefined) {
            if (type != null) {
              res.setHeader('Content-Type', type)
            }
            else if (typeof data === 'string') {
              res.setHeader('Content-Type', 'text/plain')
            }
            else if (Buffer.isBuffer(data)) {
              res.setHeader('Content-Type', 'application/octet-stream')
            }
            else if (isPlainObject(data) || Array.isArray(data) || typeof data === 'number' || typeof data === 'boolean' || data == null) {
              res.setHeader('Content-Type', 'application/json')
            }
            res.send(data)
            return
          }
        }
      }

      // Generated routes
      let resourceType: ResourceSchemaType | undefined
      for (const key in ctx.schema.types) {
        const type = ctx.schema.types[key]
        if (type.tags.includes('rest')) {
          const pascalCaseName = pascalCase(type.name)
          if (routeType === pascalCaseName || routeType === `${pascalCaseName}s`) {
            resourceType = type
            break
          }
          const camelCaseName = camelCase(type.name)
          if (routeType === camelCaseName || routeType === `${camelCaseName}s`) {
            resourceType = type
            break
          }
          const snakeCaseName = snakeCase(type.name)
          if (routeType === snakeCaseName || routeType === `${snakeCaseName}s`) {
            resourceType = type
            break
          }
          const kebabCaseName = kebabCase(type.name)
          if (routeType === kebabCaseName || routeType === `${kebabCaseName}s`) {
            resourceType = type
            break
          }
        }
      }

      if (resourceType) {
        const idParams = route[2]
        let data: any
        if (idParams != null) {
          const predicate = (data: any) => data.id === idParams || data._id === idParams || data.slug === idParams
          if (req.method === 'GET') {
            data = await ctx.db[resourceType.name].findFirst(predicate)
          }
          if (req.method === 'PUT' || req.method === 'PATCH') {
            data = await ctx.db[resourceType.name].updateFirst(req.body, predicate)
          }
          if (req.method === 'DELETE') {
            data = await ctx.db[resourceType.name].delete(predicate)
          }
        }
        else {
          if (req.method === 'GET') {
            data = await ctx.db[resourceType.name].findMany()
          }
          if (req.method === 'POST') {
            data = await ctx.db[resourceType.name].create({ data: req.body })
          }
        }
        res.json(data)
        return
      }

      res.status(404).send('Not found')
    }
    catch (e: any) {
      res.status(500).send(e.stack ?? e.message)
    }
  })
}
