import type { ResourceSchemaField } from '@moquerie/core'

export interface Col {
  label: string
  field: string
  size: number
  fieldData?: ResourceSchemaField
}

export interface ColData {
  size?: number
}
