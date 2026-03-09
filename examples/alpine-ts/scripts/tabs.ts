import * as tabs from "@zag-js/tabs"
import { tabsControls } from "@zag-js/shared"
import Alpine from "alpinejs"
import { useData, usePlugin } from "../lib"

Alpine.data("tabs", useData(tabsControls))
Alpine.plugin(usePlugin("tabs", tabs))
Alpine.start()
