import * as zagSwitch from "@zag-js/switch"
import Alpine from "alpinejs"
import { usePlugin } from "~/lib"

Alpine.plugin(usePlugin("switch", zagSwitch))
Alpine.start()
