/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  reactStrictMode: true,
  images: {
    domains: ["cloud.appwrite.io", "image.pollinations.ai"],
  },
}

module.exports = nextConfig
