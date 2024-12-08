"use client"

import { Button } from "@/components/ui/button"
import React from "react"
import { account } from "@/lib/appwrite"
import { OAuthProvider } from "appwrite"

const LoginButton = () => {
  const handleLoginWithGoogle = async () => {
    try {
      console.log("Starting Google login process...")
      await account.createOAuth2Session(
        "google" as OAuthProvider,
        "https://flux-sage.vercel.app/profile",
        "https://flux-sage.vercel.app/fail"
      )
    } catch (err) {
      console.error("Error during Google login:", err)
    }
  }

  return <Button onClick={handleLoginWithGoogle}>Login with Google</Button>
}

export default LoginButton
