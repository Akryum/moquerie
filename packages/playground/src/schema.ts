import { makeExecutableSchema } from '@graphql-tools/schema'
import type { YogaInitialContext } from 'graphql-yoga'
import type { Resolvers } from './generated/graphql.js'
import type { Context } from './context.js'

export const schema = makeExecutableSchema({
  typeDefs: /* GraphQL */ `
    type User {
      id: ID!
      name: String!
      email: String!
      avatarUrl: String
    }

    type Query {
      hello: String
      currentUser: User
    }
  `,
  resolvers: {
    Query: {
      hello: () => 'world',
    },
  } satisfies Resolvers<YogaInitialContext & Context>,
})
