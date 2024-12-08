"use client"
import { useEffect, useState } from "react"
import { account, databases } from "../../../lib/appwrite" // Ensure this matches your setup
import LoaderSpinner from "@/components/LoaderSpinner"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { toast } from "react-toastify"
import { Account, Client } from "appwrite"
import { useRouter } from "next/navigation"
import Login from "@/app/(auth)/sign-in/page"

interface UserData {
  $id: string
  name: string
  email: string
}

const TokenManager = () => {
  const [user, setUser] = useState<UserData | null>(null)
  const [tokens, setTokens] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [purchaseableAmount, setPurchaseableAmount] = useState<number>(0)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  console.log(purchaseableAmount)

  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_URL!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  const account = new Account(client)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await account.get()
        setUser(user)
        setUserId(user.$id)
      } catch (error) {
        console.log(error)
      }
    }

    checkUser()
  }, [router])

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const session = await account.get()
        const userId = session.$id
        setUser(session)

        const userDoc = await databases.getDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID!,
          userId
        )
        setTokens(userDoc.tokens || 0)
      } catch (err) {
        console.error("Error fetching user data or tokens:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  // Function to update tokens based on the amount
  const addTokens = async (amount: number): Promise<void> => {
    setPurchaseableAmount(amount)

    try {
      const userId = user?.$id // Get the user ID from the session

      if (userId) {
        // Fetch the user's document again to get the current tokens
        const userDoc = await databases.getDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID!,
          userId
        )

        // Increment the token count by the amount passed
        const newTokenCount = (userDoc.tokens || 0) + amount

        // Update the token count in the database
        await databases.updateDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID!,
          userId,
          { tokens: newTokenCount }
        )

        toast.success("Tokens added successfully!") // Show success toast
        // Update the token count in the UI
        setTokens(newTokenCount)
      }
    } catch (err) {
      toast.error("Failed to add tokens.") // Show error toast
      console.error("Error updating tokens:", err)
    }
  }

  if (loading)
    return (
      <div>
        <LoaderSpinner />
      </div>
    )

  if (!user) return <Login />

  return (
    <div className="p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-6 mt-20 lg:mt-0">
        <h1 className="text-3xl font-semibold text-center">Tokens</h1>
        <div className="mt-4 text-center">
          <h2 className="text-xl font-bold">{user?.name}</h2>
          <p className="mt-2 text-gray-500">You have {tokens} tokens.</p>
        </div>
        <div className="mt-6 flex justify-center">
          <Link
            href="/create"
            className="bg-white text-slate-700 border font-semibold px-6 py-1 rounded-lg mt-6 hover:bg-gray-100 transition"
          >
            Create Image
          </Link>
        </div>
      </div>

      <div className="flex flex-center flex-col md:flex-row gap-4">
        <div
          className="bg-gradient-to-t from-slate-600 to-slate-50  text-slate-800 
        rounded-lg shadow-lg p-6 flex flex-col border justify-center items-center min-w-[320px] max-w-[20vw] h-[46vh]"
        >
          <h3 className="text-2xl font-semibold">Basic Deal</h3>
          <p className="mt-4">Get 50 tokens for only $5</p>
          <ul className="mt-4 space-y-2 text-center">
            <li>✔️ Instant delivery</li>
            <li>✔️ Great value</li>
            <li>✔️ Perfect for casual users</li>
          </ul>
          <Button
            onClick={() => addTokens(50)}
            className="bg-white text-slate-700 border font-semibold px-6 py-1 rounded-lg mt-6 hover:bg-gray-100 transition"
          >
            Purchase 50 tokens
          </Button>
        </div>

        <div
          className="bg-gradient-to-t from-slate-600 to-slate-50 text-slate-800 
        rounded-lg shadow-lg p-6 flex flex-col justify-center border items-center min-w-[320px]  max-w-[18vw] h-[46vh]"
        >
          <h3 className="text-2xl font-semibold">Premium Deal</h3>
          <p className="mt-4">Get 200 tokens for only $15</p>
          <ul className="mt-4 space-y-2 text-center">
            <li>✨ Instant delivery</li>
            <li>✨ Best value</li>
            <li>✨ For frequent users</li>
            <li>✨ Exclusive bonuses</li>
          </ul>
          <Button
            onClick={() => addTokens(200)}
            className="bg-white text-slate-700 border font-semibold px-6 py-1 rounded-lg mt-6 hover:bg-gray-100 transition"
          >
            Purchase 200 tokens
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TokenManager
