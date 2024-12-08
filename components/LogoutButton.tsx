"use client"
import { useRouter } from "next/navigation"
import { account } from "../lib/appwrite"
import { Button } from "./ui/button"
import { useState } from "react"

const LogoutButton = () => {
  const [user, setUser] = useState(null)
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await account.deleteSession("current")
      setUser(null)
      router.push("/sign-in")
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error logging out:", err.message)
      } else {
        console.error("Error logging out:", err)
      }
    }
  }

  return <Button onClick={handleLogout}>Logout</Button>
}

export default LogoutButton
