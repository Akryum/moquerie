export interface MyObject {
  id: string
  title: string
  count: number
}

export interface User {
  id: string
  name: string
  email: string
  messages: Message[]
}

export interface Message {
  id: string
  text: string
  user: User
}
