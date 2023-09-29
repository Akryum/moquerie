import type { YogaInitialContext } from 'graphql-yoga'
import { getUser, type AuthenticatedUser } from './auth.js'

export interface Context {
  user: AuthenticatedUser | null
}

export async function getContext (initialContext: YogaInitialContext): Promise<Context> {
  return {
    user: await getUser(initialContext.request.headers.get('authorization') ?? '')
  }
}
