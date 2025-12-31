import * as tabs from "@zag-js/tabs"
import Alpine from "alpinejs"
import { usePlugin } from "~/lib"

Alpine.plugin(usePlugin("tabs", tabs))
Alpine.start()
