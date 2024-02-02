import SuperJSON from 'superjson'

export default defineEventHandler(async (event) => {
  const mq = getMq()
  const { recordId } = getRouterParams(event)
  const ctx = await mq.getResolvedContext()
  const { historyRecords } = ctx
  const record = historyRecords.find(r => r.id === recordId)

  if (!record) {
    throw new Error('Record not found')
  }

  return SuperJSON.stringify(record)
})
