import type { Server as HTTPServer } from 'node:http'
import { createServer as createHttpServer } from 'node:http'
import type { Application } from 'express'
import express from 'express'
import colors from 'picocolors'
import type { Context } from './context.js'
import type { ServerRouteInfo } from './types/server.js'

export interface Server {
  context: Context
  httpServer: HTTPServer
  expressApp: Application
  routeInfos: ServerRouteInfo[]

  restart(): void
}

async function listen(context: Context, expressApp: Application) {
  const httpServer = createHttpServer(expressApp)

  await new Promise<void>((resolve) => {
    httpServer.listen(context.port, () => {
      // eslint-disable-next-line no-console
      console.log(`API available at ${colors.blue(`http://localhost:${context.port}/`)}`)
      resolve()
    })
  })

  return httpServer
}

export async function createServer(context: Context): Promise<Server> {
  const routeInfos: ServerRouteInfo[] = []
  const expressApp = express()

  if (context.config.graphql) {
    const { createYogaServer } = await import('./graphql/index.js')
    const { yoga } = await createYogaServer()
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
  }

  async function restart() {
    await new Promise<void>((resolve, reject) => {
      server.httpServer.close((err) => {
        if (err) {
          reject(err)
        }
        else {
          resolve()
        }
      })
    })
    await listen(context, expressApp)
  }

  return server
}
