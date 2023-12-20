export function useTagModel(target: any, key: string) {
  return computed<string>({
    get: () => target[key]?.join(', ') ?? '',
    set: (value) => {
      try {
        target[key] = value.split(',').map(tag => tag.trim())
      }
      catch (e) {
        console.warn(e)
      }
    },
  })
}
