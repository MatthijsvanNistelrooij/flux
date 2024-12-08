"use client"
import Link from "next/link"
import React, { useEffect, useState } from "react"
import LoginButton from "./LoginButton"
import LogoutButton from "./LogoutButton"
import { useRouter } from "next/navigation"
import { Account, Client } from "appwrite"
import { User } from "@/types"
import { Button } from "./ui/button"

const Sidebar = () => {
  const [user, setUser] = useState<User | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const router = useRouter()

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
    <nav className="sidebar">
      <div className="flex flex-col gap-2 p-2">
        <Link href={"/"} className="nav-link">
          Gallery
        </Link>
        <Link href={"/create"} className="nav-link">
          Create
        </Link>
        <Link href={"/profile"} className="nav-link">
          Profile
        </Link>
        <Link href={"/tokens"} className="nav-link">
          Tokens
        </Link>
      </div>
      <div>
        {user && (
          <p className="text-xs m-4 text-slate-500">
            Logged in: {user.name || "Unknown User"}
          </p>
        )}
        <div className="flex flex-row gap-2 justify-between border-t p-3">
          {user ? <LogoutButton /> : <LoginButton />}

          <Link href={"/contact"}>
            <Button>Contact</Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Sidebar
