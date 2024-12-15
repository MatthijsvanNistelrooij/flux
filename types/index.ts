import { Models } from "appwrite"

export interface User {
  $id: string
  name?: string
  email: string
  tokens?: number
}

export interface Post extends Models.Document {
  title: string
  description: string
  imageId: string
  creator: User // Assuming `User` is another defined type
  userId: string
  user: string
}

export interface Comment {
  content: string
  userId: string
  user: User
  image: Post
  createdAt: string
}
