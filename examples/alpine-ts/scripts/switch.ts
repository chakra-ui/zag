import * as zagSwitch from "@zag-js/switch"
import { switchControls } from "@zag-js/shared"
import Alpine from "alpinejs"
import { useControls } from "./use-controls"
import { usePlugin } from "../lib"

Alpine.data("zagSwitch", useControls(switchControls))
Alpine.plugin(usePlugin("switch", zagSwitch))
Alpine.start()
