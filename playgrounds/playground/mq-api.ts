/* eslint-disable antfu/no-top-level-await */
/* eslint-disable no-console */
import process from 'node:process'
import { createInstanceFromFactory, createMoquerieInstance, getFactoryByName, runScript, startServer } from 'moquerie'

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
console.log(instance)

const ctx = await mq.getResolvedContext()
// You can even check for the tags
// @ts-expect-error example file
const me = await ctx.db.User.findFirstReference((data, { tags }) => tags.includes('me'))
console.log(me)

await mq.destroy()
