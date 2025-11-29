import * as tagsInput from "@zag-js/tags-input"
import Alpine from "alpinejs"
import { usePlugin } from "~/lib"

Alpine.magic("toDashCase", () => {
  return (str: string) => str.replace(/\s+/g, "-").toLowerCase()
})
Alpine.plugin(usePlugin("tags-input", tagsInput))
Alpine.start()
