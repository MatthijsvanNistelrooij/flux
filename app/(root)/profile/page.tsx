"use client"
import Login from "@/app/(auth)/sign-in/page"
import Collection from "@/components/Collection"
import LoaderSpinner from "@/components/LoaderSpinner"
import { Account, Client, Databases } from "appwrite"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"

// Define types for the user data
interface User {
  $id: string
  name: string | null
  email: string
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [tokens, setTokens] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()

  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_URL!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

  const account = new Account(client)
  const databases = new Databases(client)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await account.get()
        setUser(userData)

        const { $id, name } = userData
        const username = name || "Anonymous"

        try {
          const userDoc = await databases.getDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID!,
            $id
          )
          setTokens(userDoc.tokens || 0)
        } catch (docError: any) {
          if (docError.code === 404) {
            // Document not found, create one
            await databases.createDocument(
              process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
              process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID!,
              $id,
              {
                username,
                images: [],
                tokens: 50,
                userId: $id,
              }
            )
            setTokens(50)
          } else {
            throw docError
          }
        }
      } catch (err) {
        console.error("Error fetching user or document:", err)
        setError("Failed to fetch user data.")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  if (loading) {
    return (
      <div>
        <LoaderSpinner />
      </div>
    )
  }

  if (error) {
    return <div>Error: {error}</div>
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
      <Collection filter="profile" />
    </div>
  )
}

export default Profile
