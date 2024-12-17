import Collection from "@/components/Collection"
import InfiniteScroll from "@/components/InfiniteScroll"

const Home = () => {
  return (
    <div className="flex-center p-5 bg-gradient-to-bl from-purple-50 via-blue-50 to-orange-50">
      {/* <Collection filter="home" /> */}
      <InfiniteScroll filter="home" />
    </div>
  )
}

export default Home
