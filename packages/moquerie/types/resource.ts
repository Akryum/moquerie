export interface ResourceSchemaCommon {
  name: string
  tags: readonly string[]
  description?: string
  hasAction: boolean
  array: boolean
  nonNull: boolean
  deprecationReason?: string
}

export type ResourceSchemaType = ResourceSchemaCommon & (
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
    type: 'object'
    fields: Record<string, ResourceSchemaField>
  }
)

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
    resource: ResourceSchemaType
  }
)

export interface ResourceInstance<TType extends ResourceSchemaType = ResourceSchemaType> {
  id: string
  type: TType
  value: TType['array'] extends true
    ? Array<ResourceInstanceValue<TType>>
    : ResourceInstanceValue<TType>
}

export type ResourceInstanceValue<TType extends ResourceSchemaType> =
  TType['type'] extends 'string'
    ? string
    : TType['type'] extends 'number'
      ? number
      : TType['type'] extends 'boolean'
        ? boolean
        : TType['type'] extends 'date'
          ? Date
          : TType['type'] extends 'any'
            ? any
            : TType extends Extract<ResourceSchemaType, { type: 'object' }>
              ? ResourceInstanceObjectValue<TType['fields']>
              : never

export type ResourceInstanceObjectValue<TFields extends Record<string, ResourceSchemaField>> = {
  [K in keyof TFields]: ResourceInstanceFieldValueMightBeArray<TFields[K]>
}

export type ResourceInstanceFieldValueMightBeArray<TField extends ResourceSchemaField> =
  TField['array'] extends true
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
          : TField['type'] extends 'any'
            ? any
            : TField extends Extract<ResourceSchemaField, { type: 'resource' }>
              ? ResourceInstance<TField['resource']>
              : never

// function create<TType extends ResourceSchemaType>(type: TType, value: ResourceInstance<TType>['value']): ResourceInstance<TType> {
//   return {
//     id: uuid(),
//     type,
//     value,
//   }
// }

// const meow1 = create({
//   name: 'meow',
//   tags: [],
//   description: '',
//   hasAction: false,
//   array: false,
//   type: 'string',
// }, 'meow')

// const val1 = meow1.value

// const meow = create({
//   name: 'meow',
//   tags: [],
//   description: '',
//   hasAction: false,
//   array: false,
//   type: 'object',
//   fields: {
//     meow: {
//       name: 'meow',
//       tags: [],
//       description: '',
//       hasAction: false,
//       array: false,
//       type: 'string',
//     },
//   },
// }, {
//   meow: 'meow',
// })

// const val = meow.value
// const v = val.meow
