import type { QueryManager } from 'moquerie'

import type {
  Mutation,
  MutationAPayload,
  MutationBPayload,
  MyObject,
  MyObjectNotExported,
  MyOtherObject,
  OldObject,
  Query,
  Simple,
  Subscription,
  User,
} from './resources.js'

declare module 'moquerie' {
  export interface QueryManagerProxy {
    Mutation: QueryManager<Mutation>
    Query: QueryManager<Query>
    Subscription: QueryManager<Subscription>
    MutationAPayload: QueryManager<MutationAPayload>
    MutationBPayload: QueryManager<MutationBPayload>
    MyObject: QueryManager<MyObject>
    MyObjectNotExported: QueryManager<MyObjectNotExported>
    MyOtherObject: QueryManager<MyOtherObject>
    Simple: QueryManager<Simple>
    User: QueryManager<User>
    OldObject: QueryManager<OldObject>
  }
}
