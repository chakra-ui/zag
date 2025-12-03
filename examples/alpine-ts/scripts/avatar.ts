import * as avatar from "@zag-js/avatar"
import { avatarData } from "@zag-js/shared"
import Alpine from "alpinejs"
import { usePlugin } from "~/lib"

const images = avatarData.full

Alpine.magic("broken", () => avatarData.broken)
Alpine.magic("getRandomImage", () => {
  return () => images[Math.floor(Math.random() * images.length)]
})
Alpine.plugin(usePlugin("avatar", avatar))
Alpine.start()
