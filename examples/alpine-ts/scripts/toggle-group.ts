import * as toggle from "@zag-js/toggle-group"
import { toggleGroupControls } from "@zag-js/shared"
import Alpine from "alpinejs"
import { useData, usePlugin } from "../lib"

Alpine.data("toggle", useData(toggleGroupControls))
Alpine.plugin(usePlugin("toggle", toggle))
Alpine.start()
