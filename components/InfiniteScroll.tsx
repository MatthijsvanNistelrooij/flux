"use client"
import { useEffect, useState } from "react"
import { Databases, Storage } from "appwrite"
import { client, account } from "../lib/appwrite"
import Link from "next/link"
import Image from "next/image"
import { Query } from "node-appwrite"
import LoaderSpinner from "./LoaderSpinner"
import { Post } from "@/types"
import { FaDownload, FaTrash } from "react-icons/fa"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import SearchBar from "./SearchBar"

interface CollectionProps {
  filter: string
}

const comments = [
  { poster: "Alice", content: "Great post!", createdAt: "2024-12-01 14:32" },
  { poster: "Bob", content: "Amazing!", createdAt: "2024-12-01 15:45" },
  {
    poster: "Charlie",
    content: "Great looking post!",
    createdAt: "2024-12-01 16:20",
  },
  {
    poster: "Diana",
    content: "Looking Good! Amazing!",
    createdAt: "2024-12-01 17:10",
  },
]

const InfiniteScroll = ({ filter }: CollectionProps) => {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [previews, setPreviews] = useState<Record<string, string>>({})
  const [userId, setUserId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredPosts = posts
    .slice()
    .reverse()
    .filter((post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

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

  const CommentLine = ({
    poster,
    content,
    createdAt,
  }: {
    poster: string
    content: string
    createdAt: string
  }) => (
    <div className="p-2.5 border border-gray-300 rounded-lg mb-2 max-w-md flex flex-col relative">
      <p className="m-0 text-sm font-bold text-gray-800">{poster}</p>
      <p className="mt-0.5 mb-0 text-gray-600 text-sm">{content}</p>
      <p className="m-0 text-[10px] text-black absolute bottom-2 right-3">
        {createdAt}
      </p>
    </div>
  )

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
      <div className="flex-center mt-0 flex-col">
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
    <div className="mx-auto mt-20 mb-40 max-w-xl lg:max-w-5xl">
      <SearchBar onSearch={setSearchQuery} />

      {filteredPosts.map((post) => (
        <Link key={post.$id} href={`/image/${post.$id}`} className="bg-white">
          <div>
            {previews[post.$id] && (
              <div
                key={post.$id}
                className="w-full flex flex-col items-center mb-10 0 h-screen justify-center"
              >
                <div className="flex w-full">
                  <div className="flex-1 relative">
                    {previews[post.$id] && (
                      <div className="relative w-full h-auto bg-black">
                        <Image
                          src={`${previews[post.$id]}`}
                          alt={post.title}
                          width={1920}
                          height={1080}
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    )}

                    <div className="flex flex-row justify-between">
                      <div>
                        <FaTrash className="cursor-pointer m-5" />
                      </div>

                      <div className="mt-2 text-center text-sm text-gray-700">
                        <p>{post.title}</p>
                        <p>Created by {post.user}</p>
                      </div>
                      <FaDownload className="cursor-pointer m-5" />
                    </div>
                  </div>

                  <div className="hidden lg:flex flex-col ml-5">
                    <div className="flex flex-row w-80 gap-1">
                      <Input placeholder="type something..." />
                      <Button>Post</Button>
                    </div>
                    <div className="mt-5">
                      {comments.map((comment, index) => (
                        <CommentLine
                          key={index}
                          poster={comment.poster}
                          content={comment.content}
                          createdAt={comment.createdAt}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}

export default InfiniteScroll
