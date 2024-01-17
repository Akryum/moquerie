import type { DBLocation } from './db.js'
import type { User } from './user.js'

export interface DatabaseSnapshot {
  id: string
  location: DBLocation
  description?: string
  date: Date
  author: User
  tags: string[]
}
