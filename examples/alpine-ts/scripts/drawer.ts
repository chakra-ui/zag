import * as drawer from "@zag-js/drawer"
import Alpine from "alpinejs"
import { usePlugin } from "../lib"

Alpine.plugin(usePlugin("drawer", drawer))
Alpine.start()
