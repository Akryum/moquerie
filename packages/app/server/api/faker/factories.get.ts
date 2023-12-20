export default defineEventHandler(async () => {
  const { faker } = await import('@faker-js/faker')
  const deprecated = [
    'address',
    'name',
    'random',
  ]
  const result: string[] = []

  for (const key of Object.keys(faker)) {
    if (deprecated.includes(key) || key.startsWith('_')) {
      continue
    }

    // @ts-expect-error no index defined
    const value = faker[key]

    if (typeof value === 'object') {
      for (const subKey of Object.keys(value)) {
        if (subKey === 'faker') {
          continue
        }
        const subValue = value[subKey]
        if (typeof subValue === 'function') {
          result.push(`${key}.${subKey}`)
        }
      }
    }
  }

  return result.sort((a, b) => a.localeCompare(b))
})
