import * as accordion from "@zag-js/accordion"
import { accordionControls } from "@zag-js/shared"
import Alpine from "alpinejs"
import { useControls } from "./use-controls"
import { usePlugin } from "../lib"

Alpine.data("accordion", useControls(accordionControls))
Alpine.plugin(usePlugin("accordion", accordion))
Alpine.start()
