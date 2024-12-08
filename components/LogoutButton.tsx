"use client"
import { useRouter } from "next/navigation"
import { account } from "../lib/appwrite"
import { Button } from "./ui/button"
import { useState, useEffect } from "react"
import { FaSignOutAlt } from "react-icons/fa"

const LogoutButton = () => {
  const [user, setUser] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
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

  useEffect(() => {
    const checkWidth = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    checkWidth()
    window.addEventListener("resize", checkWidth)

    return () => window.removeEventListener("resize", checkWidth)
  }, [])

  return (
    <Button onClick={handleLogout} className="flex items-center">
      {isMobile ? <FaSignOutAlt /> : "Logout"}
    </Button>
  )
}

export default LogoutButton
