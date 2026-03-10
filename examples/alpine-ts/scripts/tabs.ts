import * as tabs from "@zag-js/tabs"
import { tabsControls } from "@zag-js/shared"
import Alpine from "alpinejs"
import { useControls, usePlugin } from "../lib"

Alpine.data("tabs", useControls(tabsControls))
Alpine.plugin(usePlugin("tabs", tabs))
Alpine.start()
