import { makeExecutableSchema } from '@graphql-tools/schema'
import type { Resolvers } from './generated/graphql.js'
import type { YogaInitialContext } from 'graphql-yoga'
import type { Context } from './context.js'
 
export const schema = makeExecutableSchema({
  typeDefs: /* GraphQL */ `
    type Query {
      hello: String
    }
  `,
  resolvers: {
    Query: {
      hello: () => 'world',
    }
  } satisfies Resolvers<YogaInitialContext & Context>,
})
