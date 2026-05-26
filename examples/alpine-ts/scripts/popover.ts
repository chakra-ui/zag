import * as popover from "@zag-js/popover"
import * as presence from "@zag-js/presence"
import { popoverControls } from "@zag-js/shared"
import Alpine from "alpinejs"
import { useControls, usePlugin } from "../lib"

Alpine.data("popover", useControls(popoverControls))
Alpine.plugin(usePlugin("popover", popover))
Alpine.plugin(usePlugin("presence", presence))
Alpine.start()
