import { createPubSub as _createPubSub } from 'graphql-yoga'

export async function createPubSubs() {
  return {
    rest: _createPubSub(),
    graphql: _createPubSub(),
  }
}

export type PubSubs = Awaited<ReturnType<typeof createPubSubs>>
