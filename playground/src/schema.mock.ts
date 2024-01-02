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
  },
})
