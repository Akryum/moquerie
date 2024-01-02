export interface User {
  name: string
  email?: string
  avatar?: string
  github?: {
    login: string
    profilePageUrl?: string
  }
}
