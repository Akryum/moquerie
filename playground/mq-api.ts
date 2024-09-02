import { createInstanceFromFactory, createMoquerieInstance, getFactoryByName, getFactoryStorage, runScript, startServer } from 'moquerie'

const mq = await createMoquerieInstance({
  cwd: process.cwd(),
  watching: true,
  skipWrites: false,
})

await startServer(mq)

const report = await runScript(mq, 'createSimpleMessage')
console.log(report)

const factory = await getFactoryByName(mq, 'SimpleMessage')
const instance = await createInstanceFromFactory(mq, {
  factory,
  save: true,
})

const ctx = await mq.getResolvedContext()
// You can even check for the tags
const me = await ctx.db.User.findFirstReference((data, { tags }) => tags.includes('me'))

await mq.destroy()
