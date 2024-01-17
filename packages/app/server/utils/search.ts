import { isResourceInstanceReference } from '@moquerie/core'

export function searchInValue(reg: RegExp, value: any): boolean {
  if (Array.isArray(value)) {
    return value.some(item => searchInValue(reg, item))
  }
  else if (typeof value === 'string') {
    return !!value.match(reg)
  }
  else if (value && typeof value === 'object') {
    if (isResourceInstanceReference(value)) {
      return false
    }
    for (const key in value) {
      if (searchInValue(reg, value[key])) {
        return true
      }
    }
  }
  return false
}
