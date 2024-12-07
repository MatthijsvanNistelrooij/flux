import Link from "next/link"
import React from "react"

const Sidebar = () => {
  return (
    <nav className="sidebar">
      <div className="flex flex-col">
        <Link href={"/"}>Gallery</Link>
        <Link href={"/profile"}>Profile</Link>
        <Link href={"/profile"}>Profile</Link>
      </div>
      <div>
        <Link href={"/contact"}>Contact</Link>
        <Link href={"/logout"}>Logout</Link>
      </div>
    </nav>
  )
}

export default Sidebar
