import * as hoverCard from "@zag-js/hover-card"
import * as presence from "@zag-js/presence"
import { hoverCardControls } from "@zag-js/shared"
import Alpine from "alpinejs"
import { useControls, usePlugin } from "../lib"

const users = [
  {
    id: 1,
    name: "Alice Johnson",
    username: "@alice",
    avatar: "https://i.pravatar.cc/150?u=alice",
    bio: "Full-stack developer passionate about React and TypeScript",
    followers: 1234,
    following: 567,
  },
  {
    id: 2,
    name: "Bob Smith",
    username: "@bob",
    avatar: "https://i.pravatar.cc/150?u=bob",
    bio: "UX Designer | Coffee enthusiast | Dog lover",
    followers: 890,
    following: 234,
  },
  {
    id: 3,
    name: "Charlie Brown",
    username: "@charlie",
    avatar: "https://i.pravatar.cc/150?u=charlie",
    bio: "DevOps engineer | Cloud enthusiast | Open source contributor",
    followers: 2345,
    following: 123,
  },
  {
    id: 4,
    name: "Diana Prince",
    username: "@diana",
    avatar: "https://i.pravatar.cc/150?u=diana",
    bio: "Product Manager | Tech blogger | Speaker",
    followers: 5678,
    following: 890,
  },
]
Alpine.magic("users", () => users)

Alpine.plugin(usePlugin("presence", presence))
Alpine.data("hoverCard", useControls(hoverCardControls))
Alpine.plugin(usePlugin("hover-card", hoverCard))
Alpine.start()
