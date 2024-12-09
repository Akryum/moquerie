import type { Application } from 'express'
import type { MoquerieInstance } from '../instance.js'
import type { UntypedQueryManagerProxy } from '../resource/queryManagerProxy.js'
import type { ResourceSchemaType } from '../types/resource.js'
import { Buffer } from 'node:buffer'
import { normalizeNodeRequest } from '@whatwg-node/server'
import { nanoid } from 'nanoid'
import { camelCase, kebabCase, pascalCase, snakeCase } from 'scule'
import { getFaker } from '../factory/fakerGet.js'
import { getFactoryStorage } from '../factory/storage.js'
import { type HookBeforeSendResponseContext, hooks } from '../hooks.js'
import { generateResourceInstances } from '../resource/generateInstances.js'
import { createResourceInstanceReference } from '../resource/resourceReference.js'
import { get, isPlainObject } from '../util/object.js'
import { pickRandom, repeat } from '../util/random.js'

export async function setupRestApi(mq: MoquerieInstance, expressApp: Application) {
  expressApp.use(mq.data.context?.config.rest?.basePath ?? '/rest', async (req, res) => {
    try {
      const request = normalizeNodeRequest(req, Request)
      const query = Object.fromEntries(new URLSearchParams(request.url.split('?')[1] ?? '').entries())

      async function transformResponse(data: any, options: Omit<HookBeforeSendResponseContext, 'response' | 'type' | 'request'>) {
        const result = await hooks.callHook('beforeSendResponse', {
          response: data,
          type: 'rest',
          request,
          ...options,
        })

        if (result !== undefined) {
          return result
        }
        return data
      }

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
          let type: string | undefined
          const time = Date.now()
          let data = await route.handler({
            request,
            params,
            query,
            db: (ctx.db as UntypedQueryManagerProxy),
            pubsub: ctx.pubSubs,
            faker: await getFaker(mq),
            generateId: nanoid,
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
            readBody: async () => {
              const body = request.body as ReadableStream
              const text = ((await body.getReader().read()).value as Buffer).toString('utf-8')
              if (request.headers.get('content-type') === 'application/json') {
                return JSON.parse(text)
              }
              else if (request.headers.get('content-type') === 'application/x-www-form-urlencoded') {
                return new URLSearchParams(text)
              }
              else {
                return text
              }
            },
            createError: (message, data) => {
              const e = new Error(message)
              if (data) {
                (e as any).data = data
              }
              return e
            },
          })
          if (!mq.data.silent) {
            // eslint-disable-next-line no-console
            console.log(`[ApiRoute] ${req.method} ${req.path} handler ${Date.now() - time}ms`)
          }
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
            data = await transformResponse(data, {
              generatedResolver: false,
              params,
            })
            res.send(data)
            return
          }
        }
      }

      // Generated routes
      let resourceType: ResourceSchemaType | undefined

      const additionalResourceNames: string[] = []
      try {
        await hooks.callHookWith(async (handlers) => {
          const names = await Promise.all(handlers.map(h => h({
            path: req.path,
            request,
            schema: ctx.schema,
          })))
          additionalResourceNames.push(...names.filter(Boolean) as string[])
        }, 'resolveResourceFromRequest')
      }
      catch (e: any) {
        console.error(`Error in plugin hook "resolveResourceFromRequest"`, e.stack ?? e)
      }

      for (const key of additionalResourceNames) {
        const type = ctx.schema.types[key]
        if (type) {
          resourceType = type
          break
        }
      }

      const route = req.path.split('/')
      const routeType = route[1]

      if (!mq.data.silent) {
        // eslint-disable-next-line no-console
        console.log(`[Auto REST] ${req.method} ${req.path}`, 'query:', query, 'body:', req.body)
      }

      if (!resourceType) {
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
      }

      if (resourceType) {
        const idParams = route[2]
        let data: any
        if (idParams != null) {
          const predicate = (data: any) => data.id === idParams || data._id === idParams || data.slug === idParams
          if (req.method === 'GET') {
            data = await (ctx.db as UntypedQueryManagerProxy)[resourceType.name].findFirst(predicate)
          }
          if (req.method === 'PUT' || req.method === 'PATCH') {
            data = await (ctx.db as UntypedQueryManagerProxy)[resourceType.name].updateFirst(req.body, predicate)
          }
          if (req.method === 'DELETE') {
            data = await (ctx.db as UntypedQueryManagerProxy)[resourceType.name].delete(predicate)
          }
        }
        else {
          if (req.method === 'GET') {
            // Query filters
            const predicate = (data: any) => {
              // Text search
              if (query.__search != null) {
                const search = query.__search.toLowerCase()
                for (const key in data) {
                  if (key.match(/^(id|_id|slug)$/)) {
                    continue
                  }
                  const value = get(data, key)
                  if (typeof value === 'string' && value.toLowerCase().includes(search)) {
                    return true
                  }
                }
                return false
              }

              for (const key in query) {
                if (key.startsWith('__')) {
                  continue
                }
                // eslint-disable-next-line eqeqeq
                if (get(data, key) != query[key]) {
                  return false
                }
              }
              return true
            }

            data = await (ctx.db as UntypedQueryManagerProxy)[resourceType.name].findMany(predicate)

            // Sort
            if (query.__sort != null) {
              const [key, order] = query.__sort.split(':')
              data = data.sort((a: any, b: any) => {
                const valueA = String(get(a, key))
                const valueB = String(get(b, key))
                if (order === 'asc') {
                  return valueA.localeCompare(valueB)
                }
                return valueB.localeCompare(valueA)
              })
            }

            // Pagination
            if (query.__page != null || query.__pageSize != null) {
              let page = 0
              if (query.__page != null) {
                page = Number.parseInt(query.__page)
              }
              let pageSize = 10
              if (query.__pageSize != null) {
                pageSize = Number.parseInt(query.__pageSize)
              }
              data = data.slice(page * pageSize, (page + 1) * pageSize)
            }
          }
          if (req.method === 'POST') {
            data = await (ctx.db as UntypedQueryManagerProxy)[resourceType.name].create(req.body)
          }
        }
        data = await transformResponse(data, {
          generatedResolver: true,
          resourceName: resourceType.name,
          params: {
            id: idParams,
          },
        })
        res.json(data)
        return
      }

      res.status(404).send('Not found')
    }
    catch (e: any) {
      console.error(e)
      res.statusMessage = e.message
      res.status(500)
      if (e.data) {
        res.json(e.data)
      }
      res.end()
    }
  })
}
