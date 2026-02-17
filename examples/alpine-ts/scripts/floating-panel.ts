import * as floating from "@zag-js/floating-panel"
import Alpine from "alpinejs"
import { usePlugin } from "~/lib"

Alpine.plugin(usePlugin("floating", floating))
Alpine.start()
