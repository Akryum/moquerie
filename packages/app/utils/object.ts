export function countItemsInRecordOfArrays<T extends Record<string, any[]>>(obj: T) {
  return Object.keys(obj).reduce((acc, key) => acc + obj[key].length, 0)
}
