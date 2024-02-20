import { defineApiRoutes } from 'moquerie/mocks'

export default defineApiRoutes((router) => {
  router.get('/auth/token', async ({ db }) => {
    const Query = await db.Query.findFirst()
    if (Query?.currentUser) {
      return {
        token: Query.currentUser.id,
      }
    }
    return null
  })
})
