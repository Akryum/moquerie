export interface Mutation {
    addHello: string;
    addSimple: Simple;
    removeHello: string;
    testMutation: boolean;
}

export interface Query {
    currentUser: User;
    hello: string;
    manyHellos: string;
    manyHellosCount: number;
}

export interface Subscription {
    helloAdded: string;
    helloRemoved: string;
    simpleAdded: Simple;
}

export type Animal = Cat | Dog;

export interface Avatar {
    url: string;
}

export interface Cat {
    id: string;
    name: string;
}

export interface Dog {
    id: string;
    name: string;
}

export interface Message {
    id: string;
    archived: boolean;
    content: string;
    from: User;
    internalProp: string;
    tags: string;
    to: User;
    type: "public" | "private";
}

export interface MutationAPayload {
    id: string;
}

export interface MutationBPayload {
    id: string;
}

export interface MyObject {
    id: string;
    count: number;
    name: string;
}

export interface MyObjectNotExported {
    id: string;
    title: string;
}

export interface MyOtherObject {
    id: string;
    description: string;
    notExported: MyObjectNotExported;
    objects: MyObject;
    otherDescription: string;
    thirdDescription: string;
    deprecatedField: string;
}

export interface Simple {
    id: string;
}

export interface User {
    id: string;
    avatar: Avatar;
    avatarUrl: string;
    email: string;
    messages: Message;
    name: string;
    customInternalField: 1 | 2 | 3;
}

export interface OldObject {
    id: string;
    count: number;
    name: string;
}