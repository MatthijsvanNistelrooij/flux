"use client"
import { useRouter } from "next/navigation"
import { account } from "../lib/appwrite"
import { Button } from "./ui/button"
import { useState } from "react"

const LogoutButton = () => {
  const [user, setUser] = useState(null)
  const router = useRouter()

  console.log(user)

  const handleLogout = async () => {
    try {
      await account.deleteSession("current")
      setUser(null)
      router.push("/")
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error logging out:", err.message)
      } else {
        console.error("Error logging out:", err)
      }
    }
  }

  return (
    <Button
      onClick={handleLogout}
      className="bg-white text-slate-700 border font-bold px-6 py-1 rounded-md hover:bg-gray-100 transition text-md"
    >
      Logout
    </Button>
  )
}

export default LogoutButton
