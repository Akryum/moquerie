import type { YogaInitialContext } from 'graphql-yoga'
import type { Context } from './context.js'
import type { Resolvers } from './generated/graphql.js'
import { makeExecutableSchema } from '@graphql-tools/schema'

export const schema = makeExecutableSchema({
  typeDefs: /* GraphQL */ `
    type User {
      id: ID!
      name: String!
      email: String!
      avatarUrl: String
      avatar: Avatar
      messages: [Message!]!
    }

    type Avatar {
      url: String!
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

    type Simple {
      id: ID!
    }

    type Query {
      hello: String
      manyHellos: [String!]!
      manyHellosCount: Int!
      currentUser: User
    }

    type Mutation {
      addHello (message: String!): [String!]!
      removeHello (message: String!): [String!]!
      testMutation: Boolean
      addSimple (id: String!): Simple!
    }

    type Subscription {
      helloAdded: String!
      helloRemoved: String!
      simpleAdded: Simple!
    }

    type MutationAPayload {
      id: ID!
    }

    type MutationBPayload {
      id: ID!
    }

    interface Animal {
      id: ID!
      name: String!
    }

    type Cat implements Animal {
      id: ID!
      name: String!
    }

    type Dog implements Animal {
      id: ID!
      name: String!
    }
  `,
  resolvers: {
    Query: {
      hello: () => 'world',
    },
  } satisfies Resolvers<YogaInitialContext & Context>,
})
