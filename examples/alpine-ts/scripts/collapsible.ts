import * as collapsible from "@zag-js/collapsible"
import { collapsibleControls } from "@zag-js/shared"
import Alpine from "alpinejs"
import { useControls } from "./use-controls"
import { usePlugin } from "../lib"

Alpine.data("collapsible", useControls(collapsibleControls))
Alpine.plugin(usePlugin("collapsible", collapsible))
Alpine.start()
