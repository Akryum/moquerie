import type { DefineApiRouteSetupFn, ResolverBaseDefinitions, ResourceFactoryFn, ResourceFactoryInfo, SchemaTransformAction, ScriptFn, ScriptItem } from '@moquerie/core'

/**
 * @deprecated Use `defineResolvers` instead.
 */
export function defineFieldActions<TActions extends ResolverBaseDefinitions>(actions: TActions) {
  return {
    __resolvers: actions,
  }
}

/**
 * Define actions that are executed whenever a field is accessed.
 * @param resolvers Object of resolvers.
 * @example
 *
 * ```ts
  import { defineResolvers } from 'moquerie/mocks'

  export default {
    // Use a spread operator to be able to use other functions like `defineSchemaTransforms` or `defineScripts`
    ...defineResolvers({
      // target type is `Query`
      Query: {
        // field name is `hello`
        hello: () => 'Hello world!'
      },
      // target type is `Mutation`
      Mutation: {
        // field name is `addHello`
        addHello: async ({ input, db, pubsub }) => { // Access more using the parameter like the input or the database
          const query = await db.Query.findFirst()
          const manyHellos = query?.manyHellos ?? []
          manyHellos.push(input.message)
          await db.Query.updateFirst({
            manyHellos,
          })
          pubsub.graphql.publish('helloAdded', {
            helloAdded: input.message,
          })
          return manyHellos
        },
      },
      // target type is `User`
      User: {
        // field name is `fullName`
        fullName: ({ parent: user }) => `${user.firstName} ${user.lastName}`
      }
    })
  }
 ```
 */
export function defineResolvers<TResolvers extends ResolverBaseDefinitions>(resolvers: TResolvers) {
  return {
    __resolvers: resolvers,
  }
}

export function defineSchemaTransforms(handlers: SchemaTransformAction | Array<SchemaTransformAction>) {
  return {
    __schemaTransforms: handlers,
  }
}

export type ScriptOption = ScriptFn | {
  description?: string
  fn: ScriptFn
}

export function defineScripts(scripts: Record<string, ScriptOption>) {
  const list: Array<Omit<ScriptItem, 'file'>> = []
  for (const id in scripts) {
    const value = scripts[id]
    const item: Omit<ScriptItem, 'file'> = typeof value === 'function' ? { id, fn: value } : { id, ...value }
    list.push(item)
  }
  return {
    __scripts: list,
  }
}

export function defineApiRoutes(fn: DefineApiRouteSetupFn) {
  return {
    __apiRouteFn: fn,
  }
}

export function defineFactory<TInfo extends Partial<ResourceFactoryInfo>, TFn extends ResourceFactoryFn>(info: TInfo, fn: TFn) {
  return {
    info,
    fn,
  }
}
