import type { DBLocation, ResourceFactoryField, ResourceFactoryFieldsMap, ResourceFactoryInfo, ResourceSchemaField, ResourceSchemaType } from '@moquerie/core'

export interface FactoryData {
  name: string
  location: DBLocation
  resourceName: string
  info: Omit<ResourceFactoryInfo, 'createdAt' | 'author'>
  fields: ResourceFactoryFieldsMap
}

export interface FlatField {
  fullKey: string
  key: string
  depth: number
  factoryField: ResourceFactoryField
  resourceType: ResourceSchemaType
  childResourceType?: ResourceSchemaType
  field: ResourceSchemaField
  parent: FlatField | null
}
