import { getResolvedContext } from '@moquerie/core'
import type { PubSubs } from '@moquerie/core/dist/pubsub/createPubSub.js'

export default defineEventHandler<{ body: { type: keyof PubSubs, channel: string, payload: any } }>(async (event) => {
  const { type, channel, payload } = await readBody(event)
  const ctx = await getResolvedContext()
  ctx.pubSubs[type].publish(channel, payload)
})
