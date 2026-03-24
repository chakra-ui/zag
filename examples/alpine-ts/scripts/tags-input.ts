import * as tagsInput from "@zag-js/tags-input"
import { tagsInputControls } from "@zag-js/shared"
import Alpine from "alpinejs"
import { useControls, usePlugin } from "../lib"

Alpine.magic("toDashCase", () => {
  return (str: string) => str.replace(/\s+/g, "-").toLowerCase()
})
Alpine.data("tagsInput", useControls(tagsInputControls))
Alpine.plugin(usePlugin("tags-input", tagsInput))
Alpine.start()
