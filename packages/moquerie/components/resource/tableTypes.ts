import type { ResourceSchemaField } from '~/types/resource.js'

export interface Col {
  label: string
  field: string
  size: number
  fieldData?: ResourceSchemaField
}

export interface ColData {
  size?: number
}
