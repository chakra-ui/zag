import * as tooltip from "@zag-js/tooltip"
import Alpine from "alpinejs"
import { usePlugin } from "~/lib"

Alpine.plugin(usePlugin("tooltip-1", tooltip))
Alpine.plugin(usePlugin("tooltip-2", tooltip))
Alpine.start()
