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
