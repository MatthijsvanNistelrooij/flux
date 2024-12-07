"use client"

import LoginButton from "@/components/LoginButton"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Account, Client } from "appwrite"
import LogoutButton from "@/components/LogoutButton"

export default function Home() {
  const [userId, setUserId] = useState(null)
  const [user, setUser] = useState(null)

  const router = useRouter()

  // Initialize Appwrite Client
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_URL!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

  const account = new Account(client)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await account.get()
        setUser(user)
        setUserId(user.$id)
      } catch (error) {
        console.log(error)
      }
    }

    checkUser()
  }, [router])

  return (
    <div className="p-20 border flex flex-col gap-2">
      {user ? <p>Logged in as: {user.name}</p> : <p>no user.</p>}
      <LoginButton />

      <LogoutButton />
    </div>
  )
}
