import type { KeysMatching } from '@moquerie/core/util'

export function useTagModel<
  TTarget extends Record<string, any>,
  TKey extends KeysMatching<TTarget, string[]>,
>(target: TTarget, key: TKey) {
  return computed<string>({
    get: () => target[key]?.join(', ') ?? '',
    set: (value) => {
      try {
        target[key] = value.split(',').map(tag => tag.trim()) as TTarget[TKey]
      }
      catch (e) {
        console.warn(e)
      }
    },
  })
}
