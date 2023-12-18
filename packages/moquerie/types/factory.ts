import type { DBLocation } from './db.js'
import type { ResourceInstanceReference } from './resource.js'

export interface ResourceFactory {
  id: string
  name: string
  location: DBLocation
  tags: readonly string[]
  description?: string
  createdAt: Date
  lastUsedAt: Date | null
  resourceName: string
  createPrompts: ResourceFactoryPrompt[]
  createValue: ResourceFactoryValue
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

/**
 * We keep all fields so switching between generateTypes keeps user configuration.
 */
export interface ResourceFactoryValue {
  generateType: 'faker' | 'static' | 'resourceReference' | 'script' | 'registeredFunction' | 'importFunction'
  /**
   * Static value or script, as JS code.
   */
  staticValue?: string
  /**
   * Need to evaluate staticValue when running the factory.
   */
  staticEvaluated?: boolean
  /**
   * Faker factory. Example: 'image.avatar'.
   */
  fakerFactory?: string
  /**
   * Faker options as JS code.
   */
  fakerOptions?: string
  /**
   * In case the value is an array, this will be the number of items.
   */
  fakerCount?: number | { min: number, max: number }
  /**
   * If true, will check for duplicate values and try to generate a new one.
   */
  fakerEnforceUnique?: boolean
  /**
   * Referenced resource type.
   */
  resourceTypeName?: string
  /**
   * In case of array, it will be a list of resource ids.
   */
  instanceRefs?: ResourceInstanceReference | ResourceInstanceReference[] | null
  /**
   * Selects a random resource for the corresponding type.
   */
  resourceRandom?: boolean
  /**
   * Function to call to generate the value.
   */
  functionName?: string
  /**
   * Function to call to generate the value.
   */
  importFunctionPath?: string
  /**
   * Nested fields
   */
  children?: Record<string, ResourceFactoryValue>
}
