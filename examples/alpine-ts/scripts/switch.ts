import * as zagSwitch from "@zag-js/switch"
import { switchControls } from "@zag-js/shared"
import Alpine from "alpinejs"
import { useData, usePlugin } from "../lib"

Alpine.data("zagSwitch", useData(switchControls))
Alpine.plugin(usePlugin("switch", zagSwitch))
Alpine.start()
