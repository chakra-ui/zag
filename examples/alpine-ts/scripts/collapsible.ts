import * as collapsible from "@zag-js/collapsible"
import { collapsibleControls } from "@zag-js/shared"
import Alpine from "alpinejs"
import { useData, usePlugin } from "../lib"

Alpine.data("collapsible", useData(collapsibleControls))
Alpine.plugin(usePlugin("collapsible", collapsible))
Alpine.start()
