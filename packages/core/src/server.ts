import type { Server as HTTPServer } from 'node:http'
import { createServer as createHttpServer } from 'node:http'
import type { Application } from 'express'
import express from 'express'
import cors from 'cors'
import colors from 'picocolors'
import type { Context } from './context.js'
import type { ServerRouteInfo } from './types/server.js'
import type { MoquerieInstance } from './instance.js'

export interface Server {
  context: Context
  httpServer: HTTPServer
  expressApp: Application
  routeInfos: ServerRouteInfo[]

  restart: () => Promise<void>
  close: () => Promise<void>
}

export async function createServer(mq: MoquerieInstance): Promise<Server> {
  const context = await mq.getContext()

  const routeInfos: ServerRouteInfo[] = []
  const expressApp = express()

  expressApp.use(express.json())
  expressApp.use(express.urlencoded({ extended: true }))

  if (context.config.server?.cors) {
    expressApp.use(cors(context.config.server.cors))
  }

  if (context.config.rest) {
    const { setupRestApi } = await import('./rest/index.js')
    await setupRestApi(mq, expressApp)
    routeInfos.push({
      url: `http://localhost:${context.port}${mq.data.context?.config.rest?.basePath ?? '/rest'}`,
      label: 'RESTful endpoint',
      type: 'rest',
      icon: 'i-carbon-api',
    })
  }

  if (context.config.graphql) {
    const { createYogaServer } = await import('./graphql/index.js')
    const { yoga } = await createYogaServer(mq)
    expressApp.use(yoga.graphqlEndpoint, yoga)
    routeInfos.push({
      url: `http://localhost:${context.port}${yoga.graphqlEndpoint}`,
      label: 'GraphQL endpoint',
      type: 'graphql',
      icon: 'i-mdi-graphql',
    })
  }

  const httpServer = await listen(context, expressApp)

  const server: Server = {
    context,
    httpServer,
    expressApp,
    routeInfos,
    restart,
    close,
  }

  async function listen(context: Context, expressApp: Application) {
    const httpServer = createHttpServer(expressApp)

    await new Promise<void>((resolve) => {
      httpServer.listen(context.port, () => {
        if (!mq.data.silent) {
          // eslint-disable-next-line no-console
          console.log(`API available at ${colors.blue(`http://localhost:${context.port}/`)}`)
        }
        resolve()
      })
    })

    return httpServer
  }

  async function close() {
    return new Promise<void>((resolve, reject) => {
      server.httpServer.close((err) => {
        if (err) {
          reject(err)
        }
        else {
          resolve()
        }
      })
    })
  }

  async function restart() {
    await close()
    await listen(context, expressApp)
  }

  return server
}
