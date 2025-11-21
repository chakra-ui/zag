import * as clipboard from "@zag-js/clipboard"
import Alpine from "alpinejs"
import { usePlugin } from "~/lib"

Alpine.plugin(usePlugin("clipboard", clipboard))
Alpine.start()
