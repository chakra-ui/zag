import * as accordion from "@zag-js/accordion"
import { accordionControls } from "@zag-js/shared"
import Alpine from "alpinejs"
import { useData, usePlugin } from "../lib"

Alpine.data("accordion", useData(accordionControls))
Alpine.plugin(usePlugin("accordion", accordion))
Alpine.start()
