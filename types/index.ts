export interface User {
  $id: string
  name?: string
  email: string
  tokens?: number
}

export interface Post {
  title: string
  description: string
  imageId: string
  creator: User
  userId: string
  user: string
}
