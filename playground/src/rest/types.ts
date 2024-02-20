import type { MyObjectNotExported } from './other.js'

export interface MyObject {
  id: string
  name: string
  count: number
}

/**
 * Another object
 */
export interface MyOtherObject {
  id: string
  /**
   * Some useful description
   */
  description?: string
  otherDescription: string | undefined
  thirdDescription: null | string
  objects: MyObject[]
  notExported: MyObjectNotExported
}
