"use client"

import { cn } from "../lib/utils"
import Image from "next/image"
import Link from "next/link"
import React, { useEffect, useState } from "react"
import LogoutButton from "./LogoutButton"
import { account } from "../lib/appwrite"
import { sidebarLinks } from "@/constants"
import { usePathname } from "next/navigation"
import logo from "../public/logo.svg"
interface User {
  $id: string
  name: string
  email: string
  [key: string]: any
}

interface ErrorState {
  message: string
}

const MobileNav = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<ErrorState | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const getUser = async () => {
      try {
        const userData = await account.get()
        setUser(userData)
      } catch (err) {
        setUser(null)
        setError({ message: "Failed to fetch user data." })
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [])

  return (
    <div className="mobile-nav bg-white shadow-sm fixed w-full top-0 z-50">
      <nav className="flex items-center justify-between w-full">
        <Link href="/" className="flex flex-row">
          <Image src={logo} alt="logo" width={40} height={40} />
        </Link>

        <div className="flex items-center gap-4 md:gap-8 md:ml-10">
          {sidebarLinks.map(({ route, label }) => {
            const isActive =
              pathname === route || pathname.startsWith(`${route}/`)
            return (
              <Link
                href={route}
                key={label}
                className={cn(
                  "text-sm font-medium text-gray-600 hover:text-gray-900 transition",
                  {
                    "text-orange-500 font-semibold": isActive,
                  }
                )}
              >
                {label}
              </Link>
            )
          })}
        </div>

        {user && <LogoutButton />}
      </nav>
    </div>
  )
}

export default MobileNav
