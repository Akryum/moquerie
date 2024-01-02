import type { ResourceSchemaField } from '@moquerie/core'

export interface Col {
  label: string
  field: string
  size: number
  fieldAction?: { file: string }
  fieldData?: ResourceSchemaField
}

export interface ColData {
  size?: number
}
