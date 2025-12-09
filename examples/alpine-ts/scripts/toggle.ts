import * as toggle from "@zag-js/toggle"
import Alpine from "alpinejs"
import { usePlugin } from "~/lib"

Alpine.plugin(usePlugin("toggle", toggle))
Alpine.start()
