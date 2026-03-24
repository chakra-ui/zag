import * as hoverCard from "@zag-js/hover-card"
import { hoverCardControls } from "@zag-js/shared"
import Alpine from "alpinejs"
import { useControls, usePlugin } from "../lib"

Alpine.data("hoverCard", useControls(hoverCardControls))
Alpine.plugin(usePlugin("hover-card", hoverCard))
Alpine.start()
