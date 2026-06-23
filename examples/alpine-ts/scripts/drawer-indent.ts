import * as drawer from "@zag-js/drawer"
import * as presence from "@zag-js/presence"
import Alpine from "alpinejs"
import { usePlugin } from "../lib"
import { normalizeProps } from "../lib/normalize-props"
import "../../shared/styles/drawer-indent-effect.module.css"

Alpine.plugin(usePlugin("presence", presence))
Alpine.magic("stack", () => drawer.createStack())
Alpine.magic(
  "connectStack",
  () => (snapshot: drawer.DrawerStackSnapshot) => drawer.connectStack(snapshot, normalizeProps),
)
Alpine.plugin(usePlugin("drawer", drawer))
Alpine.start()
