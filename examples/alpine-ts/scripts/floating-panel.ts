import * as floating from "@zag-js/floating-panel"
import { floatingPanelControls } from "@zag-js/shared"
import Alpine from "alpinejs"
import { useControls, usePlugin } from "../lib"

Alpine.magic("axes", () => floating.resizeTriggerAxes)
Alpine.data("floating", useControls(floatingPanelControls))
Alpine.plugin(usePlugin("floating", floating))
Alpine.start()
