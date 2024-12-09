import type { HistoryRecordForList } from '@moquerie/core'
import SuperJSON from 'superjson'

export default defineEventHandler(async (event) => {
  const mq = getMq()
  const query = getQuery(event)
  const ctx = await mq.getResolvedContext()
  let historyRecords = ctx.historyRecords

  if (query.branch) {
    historyRecords = historyRecords.filter(r => r.branch === query.branch)
  }

  let page = Number.parseInt(String(query.page))
  if (Number.isNaN(page)) {
    page = 1
  }
  const pageSize = 100

  const start = (page - 1) * pageSize
  const end = start + pageSize

  const records = historyRecords.slice(start, end)

  return SuperJSON.stringify({
    records: records.map(r => ({
      id: r.id,
      type: r.type,
      date: r.date,
      branch: r.branch,
      resourceName: r.resourceName,
    } satisfies HistoryRecordForList)),
    page,
    pageSize,
    total: historyRecords.length,
  })
})
