"use client"
import { useRouter } from "next/navigation"
import { account } from "../lib/appwrite"
import { Button } from "./ui/button"
import { useState } from "react"

const LogoutButton = () => {
  const [user, setUser] = useState(null) // Initialize with null
  const router = useRouter()

  // Logout function
  const handleLogout = async () => {
    try {
      await account.deleteSession("current")
      setUser(null) // Clear user state
      router.push("/") // Redirect to home
    } catch (err) {
      console.error("Error logging out:", err.message)
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
