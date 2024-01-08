import { defineFieldActions } from 'moquerie/mocks'

export default defineFieldActions({
  Query: {
    manyHellosCount: async ({ db }) => {
      const query = await db.Query.findFirst()
      return query?.manyHellos.length ?? 0
    },
  },

  Mutation: {
    addHello: async ({ input, db }) => {
      const query = await db.Query.findFirst()
      const manyHellos = query?.manyHellos ?? []
      manyHellos.push(input.message)
      await db.Query.update({
        manyHellos,
      })
      return manyHellos
    },

    removeHello: async ({ input, db }) => {
      const query = await db.Query.findFirst()
      const manyHellos = query?.manyHellos ?? []
      const index = manyHellos.indexOf(input.message)
      if (index !== -1) {
        manyHellos.splice(index, 1)
        await db.Query.update({
          manyHellos,
        })
      }
      return manyHellos
    },

    testMutation: () => true,
  },
})
