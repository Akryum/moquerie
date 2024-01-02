export interface GithubUser {
  login: string
  avatar?: string
  profilePageUrl?: string
}

export async function findUserOnGithub(email: string): Promise<GithubUser | null> {
  const r = await fetch(`https://api.github.com/search/users?q=${email}+in:email`)
  const json = await r.json()
  if (!json.items.length) {
    return null
  }
  const item = json.items[0]
  return {
    login: item.login,
    avatar: item.avatar_url,
    profilePageUrl: item.html_url,
  }
}
