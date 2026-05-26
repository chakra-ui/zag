import * as drawer from "@zag-js/drawer"
import * as presence from "@zag-js/presence"
import { drawerControls } from "@zag-js/shared"
import Alpine from "alpinejs"
import { useControls, usePlugin } from "../lib"
import { normalizeProps } from "../lib/normalize-props"
import "../../shared/styles/drawer.module.css"
import "../../shared/styles/drawer-indent.module.css"

Alpine.plugin(usePlugin("presence", presence))
Alpine.magic("stack", () => drawer.createStack())
Alpine.magic(
  "connectStack",
  () => (snapshot: drawer.DrawerStackSnapshot) => drawer.connectStack(snapshot, normalizeProps),
)
Alpine.data("drawer", useControls(drawerControls))
Alpine.plugin(usePlugin("drawer", drawer))
Alpine.start()
