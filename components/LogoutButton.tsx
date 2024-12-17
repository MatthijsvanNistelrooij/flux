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
    <div
      onClick={handleLogout}
      className="bg-white text-red-500 shadow-none text-lg font-bold flex cursor-pointer items-center border-none flex-row justify-start h-16 gap-2"
    >
      {isMobile ? (
        <FaSignOutAlt className="text-2xl" />
      ) : (
        <>
          <FaSignOutAlt className="text-2xl" /> Sign out
        </>
      )}
    </div>
  )
}

export default LogoutButton
