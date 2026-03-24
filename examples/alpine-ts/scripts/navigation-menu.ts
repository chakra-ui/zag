import * as navigationMenu from "@zag-js/navigation-menu"
import * as presence from "@zag-js/presence"
import { navigationMenuControls } from "@zag-js/shared"
import Alpine from "alpinejs"
import { useControls, usePlugin } from "../lib"

Alpine.data("navigationMenu", useControls(navigationMenuControls))
Alpine.plugin(usePlugin("navigation-menu", navigationMenu))
Alpine.plugin(usePlugin("presence", presence))
Alpine.start()
