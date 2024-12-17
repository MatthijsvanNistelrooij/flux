"use client"
import { cn } from "@/lib/utils"

import Link from "next/link"
import React, { useEffect, useState } from "react"
import LoginButton from "./LoginButton"
import LogoutButton from "./LogoutButton"
import { usePathname, useRouter } from "next/navigation"
import { Account, Client } from "appwrite"
import { User } from "@/types"
import { Button } from "./ui/button"
import { sidebarLinks } from "@/constants"
import logo from "../public/logo.svg"
import Image from "next/image"
import { Fa500Px, FaDashcube, FaFileContract, FaMailBulk } from "react-icons/fa"

const Sidebar = () => {
  const [user, setUser] = useState<User | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const pathname = usePathname()

  console.log(pathname)

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
      <div>
        <Link href={"/"} className="">
          <Image
            alt="logo"
            src={logo}
            width={40}
            height={40}
            className="ml-4 mt-3"
          />
        </Link>
        <div className="flex flex-col gap-5 p-5 mt-5">
          {sidebarLinks.map(({ route, label, imgURL }) => {
            const isActive =
              pathname === route || pathname.startsWith(`${route}/`)

            return (
              <Link
                href={route}
                key={label}
                className={`font-bold text-lg flex flex-row gap-3 hover:bg-gray-100 p-3 rounded-lg text-center ${
                  isActive ? "bg-gray-100 text-gray-700" : "text-gray-400 "
                }`}
              >
                <Image
                  src={imgURL}
                  width={30}
                  height={30}
                  alt="icon"
                  className={`${isActive && "brightness-50"}`}
                />
                {label}
              </Link>
            )
          })}
        </div>
      </div>
      <div className="flex flex-col gap-2 justify-between p-6 border-t py-5">
        {user ? <LogoutButton /> : <LoginButton />}
      </div>
    </nav>
  )
}

export default Sidebar
