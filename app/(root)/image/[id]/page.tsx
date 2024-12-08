"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Account, Client, Databases } from "appwrite"
import { toast } from "react-toastify"
import { Button } from "@/components/ui/button"
import { Post } from "@/types"

import LoaderSpinner from "@/components/LoaderSpinner"
import Image from "next/image"

import "react-toastify/dist/ReactToastify.css"

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

  if (loading)
    return (
      <div>
        <LoaderSpinner />
      </div>
    )
  if (error) return <p>{error}</p>
  if (!post) return <p>Post not found.</p>

  return (
    <div className="flex-center h-screen p-5">
      <div className="mt-10 lg:mt-0">
        <h1 className="font-semibold border-t border-l border-r p-2">
          {post.title}
        </h1>
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={post.title}
            width={600}
            height={600}
            priority
          />
        )}
        <p className="bg-gray-100 text-xs text-slate-300 p-2">
          created by {post.user}
          <span>{formattedDate}</span>
        </p>
        <div className="flex flex-row">
          <Button onClick={handleDownload}>Download</Button>
          {user?.$id === post.userId && (
            <Button onClick={deletePost}>Delete</Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ImageDetails
