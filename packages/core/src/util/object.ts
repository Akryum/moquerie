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
