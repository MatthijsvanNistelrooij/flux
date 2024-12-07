import { Client, Account, Databases, Storage } from "appwrite"

export const appwriteConfig = {
  url: process.env.NEXT_PUBLIC_APPWRITE_URL,
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
  storageId: process.env.NEXT_PUBLIC_APPWRITE_STORAGE_ID,
  collectionId: process.env.NEXT_PUBLIC_COLLECTION_ID,
  userCollectionId: process.env.NEXT_PUBLIC_USER_COLLECTION_ID,
}

export const client = new Client()

client.setProject(appwriteConfig.projectId)
client.setEndpoint(appwriteConfig.url)

export const account = new Account(client)
export const databases = new Databases(client)
export const storage = new Storage(client)
