import * as tooltip from "@zag-js/tooltip"
import Alpine from "alpinejs"
import { usePlugin } from "~/lib"

Alpine.plugin(usePlugin("tooltip", tooltip))
Alpine.start()
