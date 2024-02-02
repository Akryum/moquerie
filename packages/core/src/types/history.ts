import type { Operation } from 'just-diff'

export interface HistoryRecord {
  id: string
  branch: string
  resourceName: string
  instanceId: string
  date: Date
  type: 'create' | 'update' | 'delete'
  diff?: Array<{
    op: Operation
    path: Array<string | number>
    value: any
  }>
  value?: any
}

export type HistoryRecordForList = Omit<HistoryRecord, 'diff' | 'value'>
