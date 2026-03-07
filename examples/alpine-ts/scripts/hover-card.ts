import * as hoverCard from "@zag-js/hover-card"
import { hoverCardControls } from "@zag-js/shared"
import Alpine from "alpinejs"
import { useData, usePlugin } from "../lib"

Alpine.data("hoverCard", useData(hoverCardControls))
Alpine.plugin(usePlugin("hover-card", hoverCard))
Alpine.start()
