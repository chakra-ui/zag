import * as drawer from "@zag-js/drawer"
import * as presence from "@zag-js/presence"
import { drawerControls } from "@zag-js/shared"
import Alpine from "alpinejs"
import { useControls, usePlugin } from "../lib"
import "../../shared/styles/drawer.module.css"

Alpine.plugin(usePlugin("presence", presence))
Alpine.data("drawer", useControls(drawerControls))
Alpine.plugin(usePlugin("drawer", drawer))
Alpine.start()
