import { GraphQLResolveInfo } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Animal = {
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type Avatar = {
  __typename?: 'Avatar';
  url: Scalars['String']['output'];
};

export type Cat = Animal & {
  __typename?: 'Cat';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type Dog = Animal & {
  __typename?: 'Dog';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

/** Message sent between users */
export type Message = {
  __typename?: 'Message';
  archived?: Maybe<Scalars['Boolean']['output']>;
  content: Scalars['String']['output'];
  /** The user who sent the message */
  from: User;
  id: Scalars['ID']['output'];
  /** Useful for filtering */
  tags: Array<Scalars['String']['output']>;
  /** The user who received the message */
  to: User;
  type: MessageType;
};

export type MessageType =
  /** Message is not visible to other users */
  | 'private'
  | 'public';

export type Mutation = {
  __typename?: 'Mutation';
  addHello: Array<Scalars['String']['output']>;
  addSimple: Simple;
  removeHello: Array<Scalars['String']['output']>;
  testMutation?: Maybe<Scalars['Boolean']['output']>;
};


export type MutationAddHelloArgs = {
  message: Scalars['String']['input'];
};


export type MutationAddSimpleArgs = {
  id: Scalars['String']['input'];
};


export type MutationRemoveHelloArgs = {
  message: Scalars['String']['input'];
};

export type MutationAPayload = {
  __typename?: 'MutationAPayload';
  id: Scalars['ID']['output'];
};

export type MutationBPayload = {
  __typename?: 'MutationBPayload';
  id: Scalars['ID']['output'];
};

export type Query = {
  __typename?: 'Query';
  currentUser?: Maybe<User>;
  hello?: Maybe<Scalars['String']['output']>;
  manyHellos: Array<Scalars['String']['output']>;
  manyHellosCount: Scalars['Int']['output'];
};

export type Simple = {
  __typename?: 'Simple';
  id: Scalars['ID']['output'];
};

export type Subscription = {
  __typename?: 'Subscription';
  helloAdded: Scalars['String']['output'];
  helloRemoved: Scalars['String']['output'];
  simpleAdded: Simple;
};

export type User = {
  __typename?: 'User';
  avatar?: Maybe<Avatar>;
  avatarUrl?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  messages: Array<Message>;
  name: Scalars['String']['output'];
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;


/** Mapping of interface types */
export type ResolversInterfaceTypes<RefType extends Record<string, unknown>> = {
  Animal: ( Cat ) | ( Dog );
};

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Animal: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Animal']>;
  Avatar: ResolverTypeWrapper<Avatar>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Cat: ResolverTypeWrapper<Cat>;
  Dog: ResolverTypeWrapper<Dog>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Message: ResolverTypeWrapper<Message>;
  MessageType: MessageType;
  Mutation: ResolverTypeWrapper<{}>;
  MutationAPayload: ResolverTypeWrapper<MutationAPayload>;
  MutationBPayload: ResolverTypeWrapper<MutationBPayload>;
  Query: ResolverTypeWrapper<{}>;
  Simple: ResolverTypeWrapper<Simple>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Subscription: ResolverTypeWrapper<{}>;
  User: ResolverTypeWrapper<User>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Animal: ResolversInterfaceTypes<ResolversParentTypes>['Animal'];
  Avatar: Avatar;
  Boolean: Scalars['Boolean']['output'];
  Cat: Cat;
  Dog: Dog;
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  Message: Message;
  Mutation: {};
  MutationAPayload: MutationAPayload;
  MutationBPayload: MutationBPayload;
  Query: {};
  Simple: Simple;
  String: Scalars['String']['output'];
  Subscription: {};
  User: User;
};

export type AnimalResolvers<ContextType = any, ParentType extends ResolversParentTypes['Animal'] = ResolversParentTypes['Animal']> = {
  __resolveType: TypeResolveFn<'Cat' | 'Dog', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type AvatarResolvers<ContextType = any, ParentType extends ResolversParentTypes['Avatar'] = ResolversParentTypes['Avatar']> = {
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CatResolvers<ContextType = any, ParentType extends ResolversParentTypes['Cat'] = ResolversParentTypes['Cat']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DogResolvers<ContextType = any, ParentType extends ResolversParentTypes['Dog'] = ResolversParentTypes['Dog']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MessageResolvers<ContextType = any, ParentType extends ResolversParentTypes['Message'] = ResolversParentTypes['Message']> = {
  archived?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  content?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  from?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  tags?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  to?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['MessageType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  addHello?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationAddHelloArgs, 'message'>>;
  addSimple?: Resolver<ResolversTypes['Simple'], ParentType, ContextType, RequireFields<MutationAddSimpleArgs, 'id'>>;
  removeHello?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationRemoveHelloArgs, 'message'>>;
  testMutation?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
};

export type MutationAPayloadResolvers<ContextType = any, ParentType extends ResolversParentTypes['MutationAPayload'] = ResolversParentTypes['MutationAPayload']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationBPayloadResolvers<ContextType = any, ParentType extends ResolversParentTypes['MutationBPayload'] = ResolversParentTypes['MutationBPayload']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  currentUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  hello?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  manyHellos?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  manyHellosCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export type SimpleResolvers<ContextType = any, ParentType extends ResolversParentTypes['Simple'] = ResolversParentTypes['Simple']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SubscriptionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
  helloAdded?: SubscriptionResolver<ResolversTypes['String'], "helloAdded", ParentType, ContextType>;
  helloRemoved?: SubscriptionResolver<ResolversTypes['String'], "helloRemoved", ParentType, ContextType>;
  simpleAdded?: SubscriptionResolver<ResolversTypes['Simple'], "simpleAdded", ParentType, ContextType>;
};

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  avatar?: Resolver<Maybe<ResolversTypes['Avatar']>, ParentType, ContextType>;
  avatarUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  messages?: Resolver<Array<ResolversTypes['Message']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  Animal?: AnimalResolvers<ContextType>;
  Avatar?: AvatarResolvers<ContextType>;
  Cat?: CatResolvers<ContextType>;
  Dog?: DogResolvers<ContextType>;
  Message?: MessageResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  MutationAPayload?: MutationAPayloadResolvers<ContextType>;
  MutationBPayload?: MutationBPayloadResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Simple?: SimpleResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
};

