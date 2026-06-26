import * as scrollArea from "@zag-js/scroll-area"
import { scrollAreaControls } from "@zag-js/shared"
import Alpine from "alpinejs"
import { usePlugin } from "../lib"
import { useControls } from "./use-controls"

Alpine.data("scrollArea", useControls(scrollAreaControls))
Alpine.plugin(usePlugin("scroll-area", scrollArea))
Alpine.start()
