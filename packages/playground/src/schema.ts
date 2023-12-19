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
      messages: [Message!]!
    }

    enum MessageType {
      public
      "Message is not visible to other users"
      private
    }

    "Message sent between users"
    type Message {
      id: ID!
      content: String!
      "The user who sent the message"
      from: User!
      "The user who received the message"
      to: User!
      archived: Boolean
      "Useful for filtering"
      tags: [String!]!
      type: MessageType!
    }

    type Query {
      hello: String
      manyHellos: [String!]!
      currentUser: User
    }
  `,
  resolvers: {
    Query: {
      hello: () => 'world',
    },
  } satisfies Resolvers<YogaInitialContext & Context>,
})
