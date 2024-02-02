import { nanoid } from 'nanoid'
import type { MoquerieInstance } from '../instance.js'
import type { HistoryRecord } from '../types/history.js'
import { getCurrentBranch } from './storage.js'

export type CreateHistoryRecordOptions = Omit<HistoryRecord, 'id' | 'date' | 'branch'>

export async function createHistoryRecord(mq: MoquerieInstance, options: CreateHistoryRecordOptions) {
  const record: HistoryRecord = {
    ...options,
    id: nanoid(),
    date: new Date(),
    branch: getCurrentBranch(mq),
  }
  const ctx = await mq.getResolvedContext()
  ctx.historyRecords.unshift(record)
  return record
}
