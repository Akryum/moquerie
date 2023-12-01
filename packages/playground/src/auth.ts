export interface AuthenticatedUser {
  id: string
}

export async function getUser(authorizationHeader: string): Promise<AuthenticatedUser | null> {
  if (authorizationHeader === 'Bearer 123')
    return { id: '123' }

  return null
}
