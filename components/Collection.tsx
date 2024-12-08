"use client"
import { useEffect, useState } from "react"
import { Databases, Storage } from "appwrite"
import { client, account } from "../lib/appwrite"
import Link from "next/link"
import Image from "next/image"
import { Query } from "node-appwrite"
import LoaderSpinner from "./LoaderSpinner"
import { Post } from "@/types"

interface CollectionProps {
  filter: string
}

const Collection = ({ filter }: CollectionProps) => {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [previews, setPreviews] = useState<Record<string, string>>({})
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await account.get()
        setUserId(user.$id)
      } catch (err: any) {
        console.error("Error fetching user data:", err.message)
      }
    }
    fetchUser()
  }, [])

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const databases = new Databases(client)
        const response = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
          [Query.limit(1000)]
        )

        const filteredPosts =
          filter === "profile" && userId
            ? (response.documents as Post[]).filter(
                (post) => post.userId === userId
              )
            : (response.documents as Post[])

        setPosts(filteredPosts)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (userId || filter !== "profile") {
      fetchPosts()
    }
  }, [filter, userId])

  useEffect(() => {
    const fetchPreviews = async () => {
      const previewsData: Record<string, string> = {}
      const storage = new Storage(client)

      for (const post of posts) {
        if (post.imageId) {
          try {
            const previewUrl = await storage.getFilePreview(
              process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
              post.imageId
            )
            previewsData[post.$id] = previewUrl
          } catch (error) {
            console.error("Error fetching file preview:", error)
          }
        }
      }

      setPreviews(previewsData)
    }

    if (posts.length > 0) {
      fetchPreviews()
    }
  }, [posts])

  if (loading) {
    return <LoaderSpinner />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center w-screen h-screen">
        <p className="text-lg font-semibold">Error: {error}</p>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="flex-center flex-col">
        <h3 className="font-semibold text-2xl mb-2">You have no Images yet</h3>
        <Link
          href={"/create"}
          className="bg-white text-slate-700 border font-semibold px-6 py-2 rounded-lg hover:bg-gray-100 transition"
        >
          Create Image
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto mb-40">
      {filter === "profile" && (
        <h3 className="font-semibold text-2xl mb-2">Your Images</h3>
      )}

      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${
          filter === "create" ? "opacity-5" : ""
        }`}
      >
        {posts
          .slice()
          .reverse()
          .map((post) => (
            <Link
              key={post.$id}
              href={`/image/${post.$id}`}
              className="bg-white"
            >
              <div>
                {previews[post.$id] && (
                  <div className="flex relative">
                    <div className="relative w-full overflow-hidden bg-black opacity-90 hover:opacity-100 transition-opacity duration-300">
                      <Image
                        src={`${previews[post.$id]}`}
                        alt={post.title}
                        width={500}
                        height={500}
                        className="w-full h-auto object-cover scale-105 hover:scale-100 transition-scale duration-300"
                      />
                    </div>
                    <div className="absolute top-0 bg-slate-600 opacity-60 text-slate-200 p-1 text-xs">
                      created by {post.user}
                    </div>
                  </div>
                )}
              </div>
            </Link>
          ))}
      </div>
    </div>
  )
}

export default Collection
