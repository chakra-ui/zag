import * as hoverCard from "@zag-js/hover-card"
import Alpine from "alpinejs"
import { usePlugin } from "~/lib"

Alpine.plugin(usePlugin("hover-card", hoverCard))
Alpine.start()
