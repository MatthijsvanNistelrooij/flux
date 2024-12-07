import Sidebar from "@/components/Sidebar"
import MobileNav from "@/components/MobileNav"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="lg:hidden">
        <MobileNav />
      </div>
      <main className="flex-1 h-screen overflow-y-scroll ml-1/4 mr-1/4 no-scrollbar">
        {children}
      </main>
      <ToastContainer position="bottom-right" />
    </div>
  )
}
