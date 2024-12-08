import { Loader } from "lucide-react"
import React from "react"

const LoaderSpinner = () => {
  return (
    <div className="flex-center flex-col h-screen w-full">
      <Loader className="animate-spin text-orange-400" size={50} />
    </div>
  )
}

export default LoaderSpinner
