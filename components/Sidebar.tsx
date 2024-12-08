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
import logo from "../public/m-favicon-color.png"
import Image from "next/image"

const Sidebar = () => {
  const [user, setUser] = useState<User | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const pathname = usePathname()

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
        <Link href={"/"} className="border-b p-3">
          <Image alt="logo" src={logo} width={50} height={50} className="ml-3" />
        </Link>
        <div className="flex flex-col gap-2">
          {sidebarLinks.map(({ route, label, imgURL }) => {
            const isActive =
              pathname === route || pathname.startsWith(`${route}/`)

            return (
              <Link
                href={route}
                key={label}
                className={cn(
                  "flex gap-3 items-center py-4 max-lg:px-4 justify-start lg:justify-start hover:border-r-4 border-orange-400 pl-4 hover:bg-gradient-to-r from-gray-50 to-slate-300",
                  {
                    "bg-nav-focus border-r-4 border-orange-400 bg-gradient-to-r from-slate-50 to-slate-300":
                      isActive,
                  }
                )}
              >
                <p className="font-semibold text-gray-800">{label}</p>
              </Link>
            )
          })}
        </div>
      </div>
      <div className="flex flex-row gap-2 justify-between p-3 border-t py-5">
        {user ? <LogoutButton /> : <LoginButton />}

        <Link href={"/contact"}>
          <Button>Contact</Button>
        </Link>
      </div>
    </nav>
  )
}

export default Sidebar
