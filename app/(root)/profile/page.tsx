"use client"
import Login from "@/app/(auth)/sign-in/page"
import Collection from "@/components/Collection"
import LoaderSpinner from "@/components/LoaderSpinner"
import { Account, Client, Databases, ID, Models } from "appwrite"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"

// Define types for the user and tokens data
interface User {
  $id: string
  name: string | null
  email: string
}

interface UserDocument {
  tokens: number
  username: string
  images: string[]
  userId: string
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [tokens, setTokens] = useState<number>(0)
  const [error, setError] = useState<Error | null>(null)

  const router = useRouter()

  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_URL as string)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID as string)

  const account = new Account(client)
  const databases = new Databases(client)

  useEffect(() => {
    const checkAndCreateUserDocument = async () => {
      try {
        console.log("Fetching Appwrite user session...")
        const userData = await account.get()
        setUser(userData)

        if (userData) {
          const { $id, name, email } = userData
          const username = name || "Anonymous"

          console.log("Checking for existing user document in the database...")
          try {
            const existingDocument = await databases.getDocument(
              process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
              process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID as string,
              $id
            )
          } catch (docError: any) {
            if (docError.code === 404) {
              console.log("User document not found, creating a new one...")
              await databases.createDocument(
                process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
                process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID as string,
                $id,
                {
                  username,
                  images: [],
                  tokens: 50,
                  userId: $id,
                }
              )
              console.log("User document created successfully.")
            } else {
              console.error("Error checking user document:", docError)
            }
          }
        }
      } catch (err) {
        console.error("Error fetching Appwrite user session:", err)
      } finally {
        setLoading(false)
      }
    }

    checkAndCreateUserDocument()
  }, [router])

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const session = await account.get()
        const userId = session.$id
        setUser(session)

        const userDoc = await databases.getDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
          process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID as string,
          userId
        )

        setTokens(userDoc.tokens || 0)
      } catch (err) {
        console.error("Error fetching user data or tokens:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const filter = "profile"

  if (loading) {
    return (
      <div>
        <LoaderSpinner />
      </div>
    )
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  if (!user) return <Login />

  return (
    <div className="p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-sm p-6 mt-20 lg:mt-0">
        <h1 className="text-3xl font-semibold text-center">Profile</h1>
        <div className="mt-4 text-center">
          <h2 className="text-xl font-bold">{user?.name}</h2>
          <p className="mt-2 text-gray-500">You have {tokens} tokens.</p>
        </div>
        <div className="mt-6 flex justify-center">
          <Link
            href="/tokens"
            className="bg-white text-slate-700 border font-semibold px-6 py-1 rounded-lg mt-6 hover:bg-gray-100 transition"
          >
            Purchase Tokens
          </Link>
        </div>
      </div>
      <Collection filter={filter} />
    </div>
  )
}

export default Profile
