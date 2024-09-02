import { QueryManager } from "moquerie";

import {
    Mutation,
    Query,
    Subscription,
    Cat,
    Dog,
    Message,
    MutationAPayload,
    MutationBPayload,
    MyObject,
    MyObjectNotExported,
    MyOtherObject,
    Simple,
    User,
    OldObject,
} from "./resources.js";

declare module "moquerie" {
    export interface QueryManagerProxy {
        Mutation: QueryManager<Mutation>;
        Query: QueryManager<Query>;
        Subscription: QueryManager<Subscription>;
        Cat: QueryManager<Cat>;
        Dog: QueryManager<Dog>;
        Message: QueryManager<Message>;
        MutationAPayload: QueryManager<MutationAPayload>;
        MutationBPayload: QueryManager<MutationBPayload>;
        MyObject: QueryManager<MyObject>;
        MyObjectNotExported: QueryManager<MyObjectNotExported>;
        MyOtherObject: QueryManager<MyOtherObject>;
        Simple: QueryManager<Simple>;
        User: QueryManager<User>;
        OldObject: QueryManager<OldObject>;
    }
}