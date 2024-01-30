import type { ResourceSchemaField, ResourceSchemaType } from '@moquerie/core'

export interface Col {
  label: string
  field: string
  size: number
  fieldAction?: { file: string }
  fieldData?: ResourceSchemaField
  childResourceType?: ResourceSchemaType
}

export interface ColData {
  size?: number
}
