"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Account, Client, Databases } from "appwrite"
import { toast } from "react-toastify"
import { Button } from "@/components/ui/button"
import { Post } from "@/types"
import { Input } from "@/components/ui/input"

import LoaderSpinner from "@/components/LoaderSpinner"
import Image from "next/image"

import "react-toastify/dist/ReactToastify.css"
import { FaDownload, FaTrash, FaTrashAlt } from "react-icons/fa"

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_URL!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

const account = new Account(client)
const databases = new Databases(client)

const ImageDetails = () => {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [post, setPost] = useState<Post | null>(null)
  const [user, setUser] = useState<{ $id: string } | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  console.log("user?.$id:", user?.$id, "post:", post)

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

  const getUser = useCallback(async () => {
    try {
      const userData = await account.get()
      setUser(userData)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchPost = useCallback(async () => {
    setLoading(true)
    try {
      const response = await databases.getDocument<Post>(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
        id!
      )
      setPost(response)
    } catch (error) {
      console.error("Failed to fetch post:", error)
      setError("Failed to load post")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    getUser()
    fetchPost()
  }, [getUser, fetchPost])

  const formattedDate = post
    ? new Date(post.$createdAt).toLocaleDateString("nl-NL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : ""

  const imageUrl = post
    ? `${process.env.NEXT_PUBLIC_APPWRITE_URL}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${post.imageId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`
    : null

  const deletePost = async () => {
    if (user?.$id !== post?.userId) {
      alert("You can only delete posts created by you.")
      return
    }

    if (confirm("Are you sure you want to delete this post?")) {
      try {
        await databases.deleteDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
          id!
        )
        router.push("/")
        toast.success("Post deleted successfully.")
      } catch (error) {
        console.error("Failed to delete post:", error)
        setError("Failed to delete post")
        toast.error("Failed to delete post.")
      }
    }
  }

  const handleDownload = async () => {
    if (!imageUrl) {
      console.error("No image to download.")
      return
    }

    try {
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error("Failed to fetch the image.")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = url
      link.download = "generated_image.png"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading the image:", error)
    }
  }

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

  if (loading)
    return (
      <div>
        <LoaderSpinner />
      </div>
    )
  if (error) return <p>{error}</p>
  if (!post) return <p>Post not found.</p>

  return (
    <div className="flex-center h-screen p-5 bg-gradient-to-bl from-purple-50 via-blue-50 to-orange-50">
      <div className="flex flex-row">
        <div className="mt-10 lg:mt-0">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={post.title}
              width={600}
              height={600}
              priority
            />
          )}

          <div className="flex flex-row justify-between">
            <div>
              <FaTrash className="cursor-pointer m-5" onClick={deletePost} />
            </div>

            <div className="mt-2 text-center text-sm text-gray-700">
              <p>{post.title}</p>
              <p>Created by {post.user}</p>
            </div>
            <FaDownload
              className="cursor-pointer m-5"
              onClick={handleDownload}
            />
          </div>
        </div>

        <div className="flex flex-col ml-5">
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
  )
}

export default ImageDetails
