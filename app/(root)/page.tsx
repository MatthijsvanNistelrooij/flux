import Collection from "@/components/Collection"
import InfiniteScroll from "@/components/InfiniteScroll"

const Home = () => {
  return (
    <div className="flex-center p-5">
      {/* <Collection filter="home" /> */}
      <InfiniteScroll filter="home" />
    </div>
  )
}

export default Home
