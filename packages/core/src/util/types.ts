export type Awaitable<T> = T | Promise<T>

export type KeysMatching<T, V> = { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T]
