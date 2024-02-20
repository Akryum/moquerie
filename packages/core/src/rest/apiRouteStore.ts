import { type Key, pathToRegexp } from 'path-to-regexp'
import { MockFileHandler } from '../mock/mockFileHandler.js'
import type { ApiRoute, ApiRouteHandlerFn, ApiRouter } from '../types/index.js'

export class ApiRouteStore extends MockFileHandler<ApiRoute> {
  constructor() {
    super('__apiRouteFn')
  }

  add(file: string, data: any): void {
    const router: ApiRouter = {
      get: (path, setup) => this.addRoute(path, 'GET', setup, file),
      post: (path, setup) => this.addRoute(path, 'POST', setup, file),
      put: (path, setup) => this.addRoute(path, 'PUT', setup, file),
      patch: (path, setup) => this.addRoute(path, 'PATCH', setup, file),
      delete: (path, setup) => this.addRoute(path, 'DELETE', setup, file),
      use: (path, setup) => this.addRoute(path, undefined, setup, file),
      middleware: setup => this.addRoute(/./, undefined, setup, file),
    }
    data(router)
  }

  addRoute(path: string | RegExp, method: string | undefined, handler: ApiRouteHandlerFn, file: string) {
    const keys: Array<Key> = []
    const finalPath = typeof path === 'string' ? pathToRegexp(path, keys) : path

    this.items.push({
      path: finalPath,
      method,
      file,
      handler,
      keys,
    })
  }
}
