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

/**
 * Modify the resource schema, for example to add internal fields that are not exposed in the API.
 * @example
 *
 * ```ts
  import { defineSchemaTransforms } from 'moquerie/mocks'

  export default {
    // Use a spread operator to be able to use other functions like `defineResolvers` or `defineScripts`
    ...defineSchemaTransforms(({ schema, createEnumField }) => {
      // Add a new field to the `User` type
      schema.types.User.fields.customInternalField = createEnumField('customInternalField', [
        { value: 1, description: 'One' },
        { value: 2, description: 'Two' },
        { value: 3, description: 'Three' },
      ])
    }),
  }
  ```
 */
export function defineSchemaTransforms(handlers: SchemaTransformAction | Array<SchemaTransformAction>) {
  return {
    __schemaTransforms: handlers,
  }
}

export type ScriptOption = ScriptFn | {
  description?: string
  /**
   * The script function.
   */
  fn: ScriptFn
}

/**
 * Add scripts to create more complex scenarios using multiple factories or other actions.
 * You can then call these scripts in the dashboard.
 *
 * @example
 *
 * ```ts
  import { defineScripts } from 'moquerie/mocks'

  export default {
    // Use a spread operator to be able to use other functions like `defineResolvers` or `defineSchemaTransforms`
    ...defineScripts({
      createSimpleMessage: {
        description: `Create a simple message sent by current user`,
        fn: async ({ generateResource, db }) => {
          // Create message
          const [ref] = await generateResource('Message', 'SimpleMessageFactory')

          // Update message with current user
          const me = await db.User.findFirstReference((data, { tags }) => tags.includes('me'))
          if (!me) {
            throw new Error(`User with tag 'me' not found`)
          }
          await db.Message.updateFirst({
            from: me,
          }, (_, instance) => instance.id === ref.__id)
        },
      },
    }),
  }
   ```
 */
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

/**
 * Define API routes to be used in the dashboard. Use the `router` parameter to add new routes answering different HTTP verbs. Inside the route handler, return the response.
 *
 * You can define parameters in the route path using the `:name` syntax (see https://www.npmjs.com/package/path-to-regexp).
 *
 * @example
 *
 * ```ts
  import { defineApiRoutes } from 'moquerie/mocks'

  export default {
    // Use a spread operator to be able to use other functions like `defineResolvers` or `defineScripts`
    ...defineApiRoutes((router) => {
      // Add a new route
      router.get('/messages/count', async ({ db }) => {
        return (await db.Message.findMany()).length
      })
    }),
  }
  ```
 */
export function defineApiRoutes(fn: DefineApiRouteSetupFn) {
  return {
    __apiRouteFn: fn,
  }
}

/**
 * Define a factory to generate resources. If you need more complex logic, create factories for the basic generation then use `defineScripts` to create scripts.
 */
export function defineFactory<TInfo extends Partial<ResourceFactoryInfo>, TFn extends ResourceFactoryFn>(info: TInfo, fn: TFn) {
  return {
    info,
    fn,
  }
}
