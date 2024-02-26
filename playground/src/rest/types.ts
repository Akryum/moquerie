import type { MyObjectNotExported } from './other.js'

export interface MyObject {
  id: string
  name: string
  count: number
}

/**
 * Another object
 * @restPath /foo
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
  /**
   * @deprecated Use `otherDescription` instead
   */
  deprecatedField: string
}

/**
 * @deprecated Use `MyOtherObject` instead
 */
export interface OldObject {
  id: string
  name: string
  count: number
}
