import { faker } from '@faker-js/faker'
import { isResourceInstanceReference } from '../resource/resourceReference.js'

export async function repeat<T>(item: any, fn: (item: any) => T, min: number, max: number) {
  const list: T[] = []
  const count = faker.number.int({
    min,
    max,
  })
  const deduped = new Set<string>()
  for (let i = 0; i < count; i++) {
    const val = await fn(item)
    if (val != null) {
      // Returned an array
      if (Array.isArray(val)) {
        const selected: any[] = []
        while (selected.length < count && val.length > 0) {
          const index = Math.floor(Math.random() * val.length)
          selected.push(val[index])
          val.splice(index, 1)
        }
        return selected
      }
      else {
        if (isResourceInstanceReference(val)) {
          const id = `${val.__resourceName}:${val.__id}`
          if (deduped.has(id)) {
            continue
          }
          deduped.add(id)
        }

        list.push(val)
      }
    }
  }
  return list
}

export function pickRandom(list: any[]) {
  if (list.length === 0) {
    return null
  }
  const index = Math.floor(Math.random() * list.length)
  return list[index]
}
