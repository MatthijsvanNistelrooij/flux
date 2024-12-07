"use client"

import LoginButton from "@/components/LoginButton"
import LogoutButton from "@/components/LogoutButton"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Account, Client } from "appwrite"
import { User } from "@/types"

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  console.log(userId)

  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_URL!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

  const account = new Account(client)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user: User = await account.get()
        setUser(user)
        setUserId(user.$id)
      } catch (error) {
        console.log("Error fetching user:", error)
      }
    }

    checkUser()
  }, [router])

  return (
    <div className="p-20 border flex flex-col gap-2">
      {user ? (
        <p>Logged in as: {user.name || "Unknown User"}</p>
      ) : (
        <p>No user logged in.</p>
      )}
      <LoginButton />
      <LogoutButton />
    </div>
  )
}
