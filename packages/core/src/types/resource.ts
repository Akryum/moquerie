export type ResourceSchemaCommon = {
  name: string
  tags: string[]
  description?: string
  nonNull: boolean
  isDeprecated: boolean
  deprecationReason?: string
} & (
  {
    array: false
  } | {
    array: true
  }
)

export type ResourceSchemaType = ResourceSchemaCommon & {
  idFields?: string[]
  fields: Record<string, ResourceSchemaField>
  /**
   * If true, the resource is not available in the explorer and cannot be store independently.
   */
  inline?: boolean
  /**
   * The type is virtual and is implemented in those types.
   */
  implementations?: string[]
}

export interface ResourceSchemaFieldEnumValue {
  value: any
  description?: string
  deprecationReason?: string
}

export type ResourceSchemaField = ResourceSchemaCommon & (
  {
    type: 'string'
  } | {
    type: 'number'
  } | {
    type: 'boolean'
  } | {
    type: 'date'
  } | {
    type: 'any'
  } | {
    type: 'resource'
    resourceName: string
  } | {
    type: 'enum'
    values: Array<ResourceSchemaFieldEnumValue>
  }
)

export interface ResourceSchema {
  types: Record<string, ResourceSchemaType>
  ignoredInExplorer?: Array<string | RegExp>
}

export interface ResourceInstance<TType extends ResourceSchemaType = ResourceSchemaType> {
  id: string
  resourceName: TType['name']
  value: ResourceInstanceValue<TType>
  createdAt: Date
  updatedAt: Date | null
  /**
   * Inactive instances are ignored.
   */
  active: boolean
  tags: string[]
  comment: string | null
  factoryId: string | null
}

export type ResourceInstanceValue<TType extends ResourceSchemaType> = ResourceInstanceObjectValue<TType['fields']>

export type ResourceInstanceObjectValue<TFields extends Record<string, ResourceSchemaField>> = {
  [K in keyof TFields]: ResourceInstanceFieldValueMightBeArray<TFields[K]>
}

export type ResourceInstanceFieldValueMightBeArray<TField extends ResourceSchemaField> =
  TField extends Extract<ResourceSchemaField, { type: 'resource' }>
    ? ResourceInstanceReference[]
    : TField['array'] extends true
      ? Array<ResourceInstanceFieldValue<TField>>
      : ResourceInstanceFieldValue<TField>

export type ResourceInstanceFieldValue<TField extends ResourceSchemaField> =
  TField['type'] extends 'string'
    ? string
    : TField['type'] extends 'number'
      ? number
      : TField['type'] extends 'boolean'
        ? boolean
        : TField['type'] extends 'date'
          ? Date
          : TField extends Extract<ResourceSchemaField, { type: 'enum' }>
            ? TField['values'][number]['value']
            : TField['type'] extends 'any'
              ? any
              : never

export interface ResourceInstanceReference {
  __resourceName: string
  __id: string
}

export type FilterActive = 'active' | 'inactive' | 'all'
