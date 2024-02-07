export function isPlainObject(o: any) {
  return Object.prototype.toString.call(o) === '[object Object]'
}

export function get(object: any, path: string): any {
  const parts = path.split('.')
  let current = object
  for (const part of parts) {
    if (current == null) {
      return undefined
    }
    let value = current[part]
    if (typeof value === 'function') {
      value = value.bind(current)
    }
    current = value
  }
  return current
}

export function set(target: any, path: string, value: any) {
  const keys = path.split('.')
  const lastKey = keys.pop()!
  const lastObj = keys.reduce((obj, key) => {
    if (!obj[key]) {
      obj[key] = {}
    }
    return obj[key]
  }, target)
  lastObj[lastKey] = value
}

export function createSpyProxy<T extends object>(target: T, maxDepth: number, handler: (path: string[], params: any[]) => void, parentPath: string[] = []): T {
  const proxyCache = new Map<string, any>()
  const proxy = new Proxy(target as any, {
    get(target, prop, receiver) {
      if (typeof prop === 'string') {
        const isFunction = typeof target[prop] === 'function'
        const isObject = typeof target[prop] === 'object'

        if (isFunction || isObject) {
          const path = [...parentPath, prop]
          if (path.length <= maxDepth) {
            const key = path.join('.')
            let result = proxyCache.get(key)
            if (!result) {
              if (isFunction) {
                result = (...params: any[]) => {
                  handler(path, params)
                  return Reflect.apply(target[prop], receiver, params)
                }
              }
              else {
                result = createSpyProxy(target[prop], maxDepth, handler, path)
              }
              proxyCache.set(key, result)
            }
            return result
          }
        }
      }
      return Reflect.get(target, prop, receiver)
    },
  }) as T
  return proxy
}
