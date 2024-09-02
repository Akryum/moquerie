import type { Faker } from '@faker-js/faker'
import type { QueryManagerProxy } from '../resource/queryManagerProxy.js'
import type { Awaitable } from '../util/types.js'
import type { QueryManager } from '../resource/queryManager.js'
import type { DBLocation } from './db.js'
import type { User } from './user.js'
import type { ResourceInstanceReference } from './resource.js'

export interface ResourceFactoryPromptChoice {
  label: string
  value: any
}

export type ResourceFactoryPrompt = {
  name: string
  description?: string
  required?: boolean
} & (
  {
    type: 'string'
    defaultValue?: string
  } | {
    type: 'number'
    defaultValue?: number
    min?: number
    max?: number
  } | {
    type: 'boolean'
    defaultValue?: boolean
  } | {
    type: 'date'
    defaultValue?: Date
  } | {
    type: 'choice'
    choices: readonly ResourceFactoryPromptChoice[]
    defaultValue?: any
  } | {
    type: 'resourceReference'
  }
)

export interface ResourceFactoryInfo {
  tags: string[]
  description?: string
  createdAt: Date
  author: User
  createPrompts: ResourceFactoryPrompt[]
  /**
   * If defined, result will be the same each time.
   */
  fakerSeed?: string | number
  fakerLocale?: string
  /**
   * Tags added to the instance.
   */
  applyTags: string[]
  /**
   * Comment set to the instance.
   */
  applyComment?: string
}

export type ResourceFactoryFieldsMap = Record<string, ResourceFactoryField>

export interface ResourceFactoryField {
  type: 'faker' | 'db' | 'repeat' | 'pickRandom' | 'object' | 'array' | 'null' | 'other'
  /**
   * Should be called after the other props are created to reuse them.
   */
  lazy?: boolean
  /**
   * JS code of the function body of the field.
   */
  lazyBody?: string
  /**
   * JS code of the value of the field.
   */
  rawCode?: string
  /**
   * Faker function name. For example: 'image.avatar'
   */
  fakerFn?: string
  /**
   * JS code of the parameters passed to the faker function.
   */
  fakerParams?: string

  /**
   * Resource name targeted by the DB function.
   * Example: `db.User.findMany()` => 'User'
   */
  dbResource?: string
  /**
   * DB function name. For example: 'findMany'
   */
  dbFn?: keyof QueryManager<any>
  /**
   * JS code of the parameters passed to the DB function.
   */
  dbParams?: string
  /**
   * References to other resources parsed from array.
   */
  dbReferences?: ResourceInstanceReference[]

  repeatMin?: number
  repeatMax?: number

  pickRandomList?: string

  value?: any

  /**
   * Single child. Currently used for repeat.
   */
  child?: ResourceFactoryField
  /**
   * Multiple children. Currently used for object.
   */
  children?: ResourceFactoryFieldsMap
  /**
   * Multiple children. Currently used for array.
   */
  arrayChildren?: ResourceFactoryField[]
}

export interface ResourceFactory {
  id: string
  name: string
  location: DBLocation
  resourceName: string
  lastUsedAt?: Date | null
  /**
   * Absolute path to the factory file
   */
  file: string
  /**
   * Factory info parsed from the file.
   */
  info: ResourceFactoryInfo
  /**
   * Parsed factory return statement to be edited in the UI.
   */
  fields: ResourceFactoryFieldsMap
  /**
   * AST of the factory file. Reused to save it.
   */
  ast?: any
}

export interface ResourceFactoryContext {
  /**
   * The faker instance.
   */
  faker: Faker
  /**
   * The database query manager.
   */
  db: QueryManagerProxy
  /**
   * Repeat a function multiple times.
   */
  repeat: <T = any>(fn: (context: ResourceFactoryLazyContext) => T, min: number, max: number) => Promise<Array<T>>
  /**
   * Pick a random item from a list.
   */
  pickRandom: <T extends string | number | boolean = any>(list: T[]) => T | null
  /**
   * Generate a random id.
   */
  generateId: () => string
}

export interface ResourceFactoryLazyContext<TItem = any> {
  item: TItem
  rootRef: ResourceInstanceReference
}

export type ResourceFactoryFn<TData = any> = (context: ResourceFactoryContext) => Awaitable<TData>

export interface DefineFactoryReturn {
  info: ResourceFactoryInfo
  fn: ResourceFactoryFn
}
