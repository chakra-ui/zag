import * as accordion from "@zag-js/accordion"
import Alpine from "alpinejs"
import { usePlugin } from "~/lib"

Alpine.plugin(usePlugin("accordion", accordion))
Alpine.start()
