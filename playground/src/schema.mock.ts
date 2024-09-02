import { defineApiRoutes, defineResolvers, defineSchemaTransforms, defineScripts } from 'moquerie/mocks'

export default {
  ...defineResolvers({
    Query: {
      manyHellosCount: async ({ db }) => {
        const query = await db.Query.findFirst()
        return query?.manyHellos.length ?? 0
      },
    },

    Mutation: {
      addHello: async ({ input, db, pubsub }) => {
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

      removeHello: async ({ input, db, pubsub }) => {
        const query = await db.Query.findFirst()
        const manyHellos = query?.manyHellos ?? []
        const index = manyHellos.indexOf(input.message)
        if (index !== -1) {
          manyHellos.splice(index, 1)
          await db.Query.updateFirst({
            manyHellos,
          })
        }
        pubsub.graphql.publish('helloRemoved', {
          helloRemoved: input.message,
        })
        return manyHellos
      },

      testMutation: () => true,

      addSimple: async ({ input, db, pubsub }) => {
        const simple = await db.Simple.create({
          id: input.id,
        })

        // Publish resource instance value

        // Either pass the value directly if it comes from `db`:
        // pubsub.graphql.publish('simpleAdded', {
        //   simpleAdded: simple,
        // })

        // Or pass the reference:
        pubsub.graphql.publish('simpleAdded', {
          simpleAdded: await db.Simple.findFirstReference(s => s.id === simple.id),
        })

        // This will not work as we lose the hidden flag:
        // pubsub.graphql.publish('simpleAdded', {
        //   simpleAdded: {
        //     ...simple,
        //   },
        // })

        return simple
      },
    },
  }),

  ...defineSchemaTransforms(({ schema, createEnumField }) => {
    schema.types.User.fields.customInternalField = createEnumField('customInternalField', [
      { value: 1, description: 'One' },
      { value: 2, description: 'Two' },
      { value: 3, description: 'Three' },
    ])
  }),

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

  ...defineApiRoutes((router) => {
    router.get('/hello', async ({ db }) => {
      return (await db.Message.findMany()).length
    })
  }),
}
