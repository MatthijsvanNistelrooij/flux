"use client"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { storage } from "../../../lib/appwrite"
import { Client, Account, Databases, ID, Models } from "appwrite"
import { useRouter } from "next/navigation"
import Image from "next/image"
import LoaderSpinner from "@/components/LoaderSpinner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"

type User = Models.User<{}> & {
  name: string
}

const ImageComponent: React.FC = () => {
  const [prompt, setPrompt] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [tokens, setTokens] = useState<number>(0)
  const [model, setModel] = useState<string>("flux")

  const router = useRouter()

  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_URL!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

  const account = new Account(client)
  const databases = new Databases(client)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await account.get<User>()
        setUser(user)
        setUserId(user.$id)

        const userDoc = await databases.getDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID!,
          user.$id
        )

        setTokens(userDoc.tokens || 0)
      } catch (error) {
        console.log(error)
      }
    }

    checkUser()
  }, [router])

  const handleGenerateImage = async () => {
    setLoading(true)
    setError(null)
    setImageUrl(null)

    try {
      if (tokens < 10) {
        throw new Error("You do not have enough tokens to generate an image.")
      }

      if (prompt === "") {
        throw new Error("Please enter a prompt to generate an image.")
      }

      if (!user) {
        throw new Error("User is not authenticated.")
      }

      const userDoc = await databases.getDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID!,
        user.$id
      )

      const newTokenCount = (userDoc.tokens || 0) - 10

      if (newTokenCount < 0) {
        throw new Error("You do not have enough tokens to generate an image.")
      }

      await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID!,
        user.$id,
        { tokens: newTokenCount }
      )

      setTokens(newTokenCount)

      const apiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
        prompt
      )}?model=${model}&width=1024&height=1024&seed=42&nologo=true`

      const response = await fetch(apiUrl)

      if (response.ok) {
        setImageUrl(apiUrl)
      } else {
        throw new Error("Failed to generate image.")
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadImage = async () => {
    if (!userId || !user) {
      toast.error("User is not authenticated.")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(imageUrl!)
      const blob = await response.blob()
      const file = new File([blob], `${prompt}.png`, { type: "image/png" })

      const fileUpload = await storage.createFile(
        process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
        ID.unique(),
        file
      )

      await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
        ID.unique(),
        {
          title: prompt,
          description: prompt,
          imageId: fileUpload.$id,
          userId: userId,
          user: user.name,
        }
      )

      toast.success("Image added successfully!")
      router.push("/")
    } catch (error) {
      toast.error("Failed to upload image.")
      console.error("Error uploading file:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteImage = () => {
    setPrompt("A futuristic city with flying cars and neon lights")
    setLoading(false)
    setImageUrl(null)
    setError(null)
  }

  return (
    <section className="flex flex-col gap-3 items-center justify-center h-screen w-full">
      {loading && (
        <div className="flex justify-center items-center">
          <LoaderSpinner />
        </div>
      )}

      {!loading && !imageUrl && (
        <div className="flex flex-col lg:flex-row text-center gap-2 w-full max-w-3xl px-4">
          <Input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A futuristic city with flying cars and neon lights"
            className="lg:w-2/4"
          />

          <Select value={model} onValueChange={(value) => setModel(value)}>
            <SelectTrigger className="lg:w-40">
              <span>{model}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flux">Flux</SelectItem>
              <SelectItem value="flux-realism">Flux Realism</SelectItem>
              <SelectItem value="flux-cablyai">Flux Cablyai</SelectItem>
              <SelectItem value="flux-anime">Flux Anime</SelectItem>
              <SelectItem value="flux-3d">Flux 3D</SelectItem>
              <SelectItem value="any-dark">Any Dark</SelectItem>
              <SelectItem value="flux-pro">Flux Pro</SelectItem>
              <SelectItem value="turbo">Turbo</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleGenerateImage}
            className="lg:w-1/4 bg-orange-500 text-white font-bold text-lg py-2 rounded-md hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            Generate
          </Button>
        </div>
      )}
      {error && !loading && <p className="text-red-500 text-start">{error}</p>}

      {!loading && imageUrl && (
        <div className="flex flex-col items-center">
          <Image
            width={600}
            height={600}
            src={imageUrl}
            alt="Generated image"
            className="rounded-none shadow-md"
          />

          <div className="flex w-full">
            <Button
              className="w-full bg-gray-100 text-gray-800 font-bold py-2 rounded-none hover:bg-orange-500"
              onClick={handleUploadImage}
            >
              Save
            </Button>
            <Button
              className="w-full bg-gray-100 text-red-500 font-bold py-2 rounded-none hover:bg-black"
              onClick={handleDeleteImage}
            >
              Discard
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}

export default ImageComponent
