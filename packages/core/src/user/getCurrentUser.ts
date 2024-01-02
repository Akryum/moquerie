import os from 'node:os'
import { LRUCache } from 'lru-cache'
import { getGitUserInfo } from 'git-user-info'
import type { User } from '../types/user.js'
import { findUserOnGithub } from './findOnGithub.js'

const userCache = new LRUCache<string, User>({
  max: 20,
  ttl: 1000 * 60 * 60, // 1 hour
})

export async function getCurrentUser() {
  const cachedUser = userCache.get('current')
  if (cachedUser) {
    return cachedUser
  }

  const user: User = {
    name: os.userInfo().username,
  }

  try {
    const gitUser = await getGitUserInfo()
    if (gitUser) {
      user.name = gitUser.name
      user.email = gitUser.email
    }
  }
  catch (e) {
    // ignore
  }

  if (user.email) {
    try {
      const githubUser = await findUserOnGithub(user.email)
      if (githubUser) {
        user.avatar = githubUser.avatar
        user.github = {
          login: githubUser.login,
          profilePageUrl: githubUser.profilePageUrl,
        }
      }
    }
    catch (e) {
      // ignore
    }
  }

  userCache.set('current', user)
  return user
}
